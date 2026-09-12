"""
Test Suite: Feature 11 — AI Negotiation Advisor
================================================
Validates the advisory-only AI chat assistant (POST /api/listings/{id}/negotiation-chat):
- Party authorization (farmer owner & active buyer allowed; non-party rejected 403)
- Authentication enforcement (unauthenticated requests rejected 401)
- Advisory-only system prompt adherence & context assembly
- Grounding with national benchmark mandi prices (market_context_used: true / false)
- Sliding-window rate limiting per user (429 Too Many Requests)
- External Groq failure handling (503 Service Unavailable)
- Audit trail database logging to negotiation_chat_logs
All external Groq API calls are strictly mocked.
"""

from datetime import date
import pytest
from unittest.mock import patch, MagicMock
from groq import APITimeoutError

from app.core.rate_limiter import negotiation_rate_limiter
from app.models.crop_listing import CropListing, CropOffer
from app.models.market import Market, MarketPrice
from app.models.negotiation_chat import NegotiationChatLog
from app.services.negotiation_advisor_service import GroqNegotiationUnavailableException


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset rate limiter before and after each test."""
    negotiation_rate_limiter.reset()
    yield
    negotiation_rate_limiter.reset()


def get_user_token(client, phone: str, role: str) -> tuple[str, int]:
    """Helper to register a user and return (jwt_token, user_id)."""
    res = client.post("/api/auth/signup", json={
        "phone": phone,
        "password": "Password123!",
        "role": role,
        "name": f"User {phone}"
    })
    data = res.json()
    return data["access_token"], data["user"]["id"]


def test_valid_chat_from_listing_farmer_returns_200_and_correct_shape(client, db_session):
    """
    1. Valid negotiation chat from the listing's farmer returns 200,
    has expected reply and market_context_used shape, and creates an audit log.
    """
    farmer_token, farmer_id = get_user_token(client, "9200000001", "farmer")
    buyer_token, buyer_id = get_user_token(client, "9200000002", "buyer")

    # Farmer creates listing
    listing_res = client.post(
        "/api/listings",
        json={"crop": "wheat", "quantity": 50.0, "unit": "quintal", "asking_price": 2400.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = listing_res.json()["id"]

    # Buyer submits offer
    client.post(
        f"/api/listings/{listing_id}/offers",
        json={"amount": 2100.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    mock_reply = "You could consider countering at ₹2,250 per quintal, which is close to fair market value."

    with patch("app.api.listing.negotiation_advisor_service.advise", return_value=(mock_reply, False)) as mock_advise:
        chat_res = client.post(
            f"/api/listings/{listing_id}/negotiation-chat",
            json={"message": "Buyer offered 2100. Should I accept or counter?"},
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert chat_res.status_code == 200
        data = chat_res.json()
        assert data["reply"] == mock_reply
        assert data["market_context_used"] is False
        mock_advise.assert_called_once()

    # Verify audit log created in DB
    log = db_session.query(NegotiationChatLog).filter(
        NegotiationChatLog.listing_id == listing_id,
        NegotiationChatLog.user_id == farmer_id
    ).first()
    assert log is not None
    assert log.role == "farmer"
    assert "2100" in log.message
    assert log.reply == mock_reply


def test_valid_chat_from_thread_buyer_returns_200(client, db_session):
    """
    2. Valid negotiation chat from a buyer who has an offer in the thread returns 200
    and logs role='buyer'.
    """
    farmer_token, _ = get_user_token(client, "9200000003", "farmer")
    buyer_token, buyer_id = get_user_token(client, "9200000004", "buyer")

    listing_res = client.post(
        "/api/listings",
        json={"crop": "cotton", "quantity": 20.0, "unit": "quintal", "asking_price": 6500.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = listing_res.json()["id"]

    # Buyer makes an offer
    client.post(
        f"/api/listings/{listing_id}/offers",
        json={"amount": 6000.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    mock_reply = "Since the farmer asks ₹6,500, a counter-offer around ₹6,200 would show good intent."

    with patch("app.api.listing.negotiation_advisor_service.advise", return_value=(mock_reply, False)):
        chat_res = client.post(
            f"/api/listings/{listing_id}/negotiation-chat",
            json={"message": "What counter-offer should I submit next?"},
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert chat_res.status_code == 200
        assert chat_res.json()["reply"] == mock_reply

    log = db_session.query(NegotiationChatLog).filter(
        NegotiationChatLog.listing_id == listing_id,
        NegotiationChatLog.user_id == buyer_id
    ).first()
    assert log is not None
    assert log.role == "buyer"


def test_chat_attempt_from_non_party_returns_403(client):
    """
    3. An authenticated user who is NOT a party to the listing's negotiation
    (different farmer or buyer with no offer on this listing) is rejected with 403 Forbidden.
    """
    farmer1_token, _ = get_user_token(client, "9200000005", "farmer")
    farmer2_token, _ = get_user_token(client, "9200000006", "farmer")
    buyer_outsider_token, _ = get_user_token(client, "9200000007", "buyer")

    listing_res = client.post(
        "/api/listings",
        json={"crop": "paddy", "quantity": 100.0, "unit": "quintal", "asking_price": 2000.0},
        headers={"Authorization": f"Bearer {farmer1_token}"}
    )
    listing_id = listing_res.json()["id"]

    # Farmer 2 (not owner) tries to chat -> 403
    res_f2 = client.post(
        f"/api/listings/{listing_id}/negotiation-chat",
        json={"message": "Advise me on this listing"},
        headers={"Authorization": f"Bearer {farmer2_token}"}
    )
    assert res_f2.status_code == 403
    assert "Forbidden" in res_f2.json()["detail"]

    # Buyer outsider (has placed no offer on this listing) tries to chat -> 403
    res_b = client.post(
        f"/api/listings/{listing_id}/negotiation-chat",
        json={"message": "Should I make an offer?"},
        headers={"Authorization": f"Bearer {buyer_outsider_token}"}
    )
    assert res_b.status_code == 403
    assert "Forbidden" in res_b.json()["detail"]


def test_chat_attempt_without_token_returns_401(client):
    """
    4. A chat attempt without an Authorization token returns 401 Unauthorized.
    """
    chat_res = client.post(
        "/api/listings/1/negotiation-chat",
        json={"message": "Can I get advice?"}
    )
    assert chat_res.status_code == 401
    assert "Authentication required" in chat_res.json()["detail"]


def test_market_data_present_sets_market_context_used_true_and_injects_mandi_prices(client, db_session):
    """
    5. When real recorded mandi market prices exist for the listing's crop,
    market_context_used is True and national benchmark prices are injected into prompt.
    """
    farmer_token, _ = get_user_token(client, "9200000008", "farmer")

    # Seed market and prices for 'mustard'
    market = Market(
        name="Alwar Mandi Test",
        state="Rajasthan",
        district="Alwar",
        latitude=27.55,
        longitude=76.63
    )
    db_session.add(market)
    db_session.flush()

    price = MarketPrice(
        market_id=market.id,
        crop="mustard",
        min_price=5200.0,
        max_price=5600.0,
        modal_price=5400.0,
        recorded_date=date.today()
    )
    db_session.add(price)
    db_session.commit()

    listing_res = client.post(
        "/api/listings",
        json={"crop": "mustard", "quantity": 40.0, "unit": "quintal", "asking_price": 5500.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = listing_res.json()["id"]

    # Mock client completion to verify system prompt and national benchmark formatting
    mock_groq = MagicMock()
    mock_completion = MagicMock()
    mock_completion.choices = [
        MagicMock(message=MagicMock(content="National modal price is ₹5,400. Counter at ₹5,450."))
    ]
    mock_groq.chat.completions.create.return_value = mock_completion

    with patch("app.services.negotiation_advisor_service.NegotiationAdvisorService.get_client", return_value=mock_groq):
        chat_res = client.post(
            f"/api/listings/{listing_id}/negotiation-chat",
            json={"message": "What is a competitive price for mustard?"},
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert chat_res.status_code == 200
        data = chat_res.json()
        assert data["market_context_used"] is True
        assert "5,400" in data["reply"]

        # Check prompt passed to Groq
        call_args = mock_groq.chat.completions.create.call_args
        messages = call_args.kwargs["messages"]
        user_msg = messages[1]["content"]
        assert "National benchmark market data for Mustard" in user_msg
        assert "5400" in user_msg
        assert "Alwar Mandi Test" in user_msg


def test_no_market_data_sets_market_context_used_false_and_responds_gracefully(client):
    """
    6. When no mandi prices exist for the crop in the database,
    market_context_used is False and general pricing guidance is provided.
    """
    farmer_token, _ = get_user_token(client, "9200000009", "farmer")

    listing_res = client.post(
        "/api/listings",
        json={"crop": "dragonfruit", "quantity": 15.0, "unit": "quintal", "asking_price": 12000.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = listing_res.json()["id"]

    mock_groq = MagicMock()
    mock_completion = MagicMock()
    mock_completion.choices = [
        MagicMock(message=MagicMock(content="No recorded mandi data found. Base your offer on production cost."))
    ]
    mock_groq.chat.completions.create.return_value = mock_completion

    with patch("app.services.negotiation_advisor_service.NegotiationAdvisorService.get_client", return_value=mock_groq):
        chat_res = client.post(
            f"/api/listings/{listing_id}/negotiation-chat",
            json={"message": "What is fair price for dragonfruit?"},
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert chat_res.status_code == 200
        data = chat_res.json()
        assert data["market_context_used"] is False

        call_args = mock_groq.chat.completions.create.call_args
        user_msg = call_args.kwargs["messages"][1]["content"]
        assert "No national mandi price records currently available" in user_msg


def test_groq_api_failure_returns_503_service_unavailable(client):
    """
    7. When the Groq API fails or times out, returns HTTP 503 Service Unavailable
    with a clear user-facing error message.
    """
    farmer_token, _ = get_user_token(client, "9200000010", "farmer")

    listing_res = client.post(
        "/api/listings",
        json={"crop": "maize", "quantity": 30.0, "unit": "quintal", "asking_price": 2100.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = listing_res.json()["id"]

    with patch(
        "app.api.listing.negotiation_advisor_service.advise",
        side_effect=GroqNegotiationUnavailableException("Groq API timeout")
    ):
        chat_res = client.post(
            f"/api/listings/{listing_id}/negotiation-chat",
            json={"message": "Should I accept 1900?"},
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert chat_res.status_code == 503
        assert "Negotiation assistant unavailable, please try again shortly" in chat_res.json()["detail"]


def test_rate_limiting_negotiation_chat_returns_429(client):
    """
    8. Making more than 10 requests within a minute for the same user triggers
    HTTP 429 Too Many Requests.
    """
    farmer_token, _ = get_user_token(client, "9200000011", "farmer")

    listing_res = client.post(
        "/api/listings",
        json={"crop": "sugarcane", "quantity": 100.0, "unit": "ton", "asking_price": 350.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    listing_id = listing_res.json()["id"]

    mock_reply = "Consider offering ₹340/ton."

    with patch("app.api.listing.negotiation_advisor_service.advise", return_value=(mock_reply, False)):
        # Exhaust 10 requests limit
        for i in range(10):
            res = client.post(
                f"/api/listings/{listing_id}/negotiation-chat",
                json={"message": f"Query number {i+1}"},
                headers={"Authorization": f"Bearer {farmer_token}"}
            )
            assert res.status_code == 200

        # 11th request should be rate-limited
        blocked_res = client.post(
            f"/api/listings/{listing_id}/negotiation-chat",
            json={"message": "Query number 11"},
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert blocked_res.status_code == 429
        assert "Rate limit exceeded" in blocked_res.json()["detail"]
