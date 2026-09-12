"""
Test Suite: Feature 17 — Deal Transactions & Lifecycle Tracking
================================================================
Verifies:
1. Accepting an offer via Feature 10 automatically creates a Transaction with matched/negotiated pre-completed and logistics active.
2. GET /api/transactions/{listing_id} as the owning farmer -> 200, correct stage data.
3. GET /api/transactions/{listing_id} as the accepted buyer -> 200.
4. GET /api/transactions/{listing_id} as a non-party -> 403.
5. confirm_pickup action -> logistics becomes completed, payment becomes active.
6. confirm_payment called before confirm_pickup -> 409 (out of sequence).
7. confirm_payment after confirm_pickup -> all stages completed, overall_status: completed.
8. GET /api/my/transactions returns only the current user's own transactions (farmer or buyer), not others'.
9. Non-farmer (buyer or other farmer) calling advance -> 403.
"""

import itertools
import pytest

_phone_seq = itertools.count(7700001000)


def get_auth_token(client, phone: str, role: str) -> tuple[str, int]:
    """Helper to register or login a user and return (jwt_token, user_id)."""
    res = client.post("/api/auth/signup", json={
        "phone": phone,
        "password": "Password123!",
        "role": role,
        "name": f"User {phone}"
    })
    if res.status_code == 409:
        res = client.post("/api/auth/login", json={
            "phone": phone,
            "password": "Password123!",
            "role": role,
        })
    data = res.json()
    return data["access_token"], data["user"]["id"]


def create_accepted_deal(client, farmer_phone: str = None, buyer_phone: str = None, price: float = 2300.0) -> tuple[int, str, str]:
    """Helper to create a listing, submit a buyer offer, and farmer accepts it."""
    if not farmer_phone:
        farmer_phone = str(next(_phone_seq))
    if not buyer_phone:
        buyer_phone = str(next(_phone_seq))

    farmer_token, _ = get_auth_token(client, farmer_phone, "farmer")
    buyer_token, _ = get_auth_token(client, buyer_phone, "buyer")

    # Farmer creates listing
    res_listing = client.post(
        "/api/listings",
        json={
            "crop": "rice",
            "quantity": 30.0,
            "unit": "quintal",
            "asking_price": 2500.0
        },
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_listing.status_code == 201
    listing_id = res_listing.json()["id"]

    # Buyer submits offer
    res_offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={"amount": price, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert res_offer.status_code == 201
    offer_id = res_offer.json()["id"]

    # Farmer accepts offer
    res_accept = client.patch(
        f"/api/listings/{listing_id}/offers/{offer_id}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_accept.status_code == 200
    assert res_accept.json()["status"] == "accepted"

    return listing_id, farmer_token, buyer_token


def test_accept_offer_auto_creates_transaction(client):
    """
    1. Accepting an offer via Feature 10 automatically creates a Transaction
    with matched & negotiated pre-completed and logistics active.
    """
    listing_id, farmer_token, buyer_token = create_accepted_deal(client, price=2450.0)

    # Fetch transaction
    res = client.get(
        f"/api/transactions/{listing_id}",
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res.status_code == 200
    data = res.json()

    assert data["listing_id"] == listing_id
    assert data["agreed_price"] == 2450.0
    assert data["logistics_status"] == "active"
    assert data["payment_status"] == "pending"
    assert data["overall_status"] == "in_progress"
    assert data["pickup_target_date"] is not None
    assert data["payment_target_date"] is not None

    # Check stage timeline
    stages = {s["stage"]: s for s in data["stages"]}
    assert stages["matched"]["status"] == "completed"
    assert stages["negotiated"]["status"] == "completed"
    assert "2450" in stages["negotiated"]["subtext"]
    assert stages["logistics"]["status"] == "active"
    assert stages["payment"]["status"] == "pending"
    assert stages["completed"]["status"] == "pending"


def test_get_transaction_as_owning_farmer(client):
    """
    2. GET /api/transactions/{listing_id} as the owning farmer -> 200, correct stage data.
    """
    listing_id, farmer_token, _ = create_accepted_deal(client, price=2200.0)

    res = client.get(
        f"/api/transactions/{listing_id}",
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["listing_id"] == listing_id
    assert len(data["stages"]) == 5
    assert data["stages"][0]["stage"] == "matched"
    assert data["stages"][0]["status"] == "completed"


def test_get_transaction_as_accepted_buyer(client):
    """
    3. GET /api/transactions/{listing_id} as the accepted buyer -> 200.
    """
    listing_id, _, buyer_token = create_accepted_deal(client, price=2150.0)

    res = client.get(
        f"/api/transactions/{listing_id}",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["listing_id"] == listing_id
    assert data["agreed_price"] == 2150.0


def test_get_transaction_as_non_party(client):
    """
    4. GET /api/transactions/{listing_id} as a non-party -> 403 Forbidden.
    """
    listing_id, _, _ = create_accepted_deal(client, price=2100.0)

    # Third-party farmer
    other_farmer_phone = str(next(_phone_seq))
    other_farmer_token, _ = get_auth_token(client, other_farmer_phone, "farmer")
    res_farmer = client.get(
        f"/api/transactions/{listing_id}",
        headers={"Authorization": f"Bearer {other_farmer_token}"}
    )
    assert res_farmer.status_code == 403
    assert "forbidden" in res_farmer.json()["detail"].lower()

    # Third-party buyer
    other_buyer_phone = str(next(_phone_seq))
    other_buyer_token, _ = get_auth_token(client, other_buyer_phone, "buyer")
    res_buyer = client.get(
        f"/api/transactions/{listing_id}",
        headers={"Authorization": f"Bearer {other_buyer_token}"}
    )
    assert res_buyer.status_code == 403
    assert "forbidden" in res_buyer.json()["detail"].lower()

    # Unauthenticated request -> 401
    res_unauth = client.get(f"/api/transactions/{listing_id}")
    assert res_unauth.status_code == 401


def test_confirm_pickup_action_advances_logistics_and_activates_payment(client):
    """
    5. confirm_pickup action -> logistics becomes completed, payment becomes active.
    """
    listing_id, farmer_token, _ = create_accepted_deal(client, price=2350.0)

    res_advance = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_pickup"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_advance.status_code == 200
    data = res_advance.json()

    assert data["logistics_status"] == "completed"
    assert data["payment_status"] == "active"
    assert data["overall_status"] == "in_progress"
    assert data["logistics_completed_at"] is not None

    stages = {s["stage"]: s for s in data["stages"]}
    assert stages["logistics"]["status"] == "completed"
    assert stages["payment"]["status"] == "active"
    assert stages["completed"]["status"] == "pending"


def test_confirm_payment_called_before_confirm_pickup_returns_409(client):
    """
    6. confirm_payment called before confirm_pickup -> 409 (out of sequence).
    """
    listing_id, farmer_token, _ = create_accepted_deal(client, price=2400.0)

    # Attempt to confirm payment when logistics is still active
    res_premature = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_payment"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_premature.status_code == 409
    assert "Conflict" in res_premature.json()["detail"]


def test_confirm_payment_after_confirm_pickup_completes_all(client):
    """
    7. confirm_payment after confirm_pickup -> all stages completed, overall_status: completed.
    Attempting further stage advancement returns 409 Conflict.
    """
    listing_id, farmer_token, _ = create_accepted_deal(client, price=2500.0)

    # Step 1: confirm pickup
    res_pickup = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_pickup"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_pickup.status_code == 200
    assert res_pickup.json()["logistics_status"] == "completed"

    # Step 2: confirm payment
    res_payment = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_payment"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_payment.status_code == 200
    data = res_payment.json()

    assert data["payment_status"] == "completed"
    assert data["overall_status"] == "completed"
    assert data["payment_completed_at"] is not None

    # All 5 stages completed
    for stage in data["stages"]:
        assert stage["status"] == "completed", f"Stage {stage['stage']} should be completed"

    # Further advancement blocked
    res_blocked = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_payment"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_blocked.status_code == 409
    assert "already completed" in res_blocked.json()["detail"]


def test_get_my_transactions_filters_by_user(client):
    """
    8. GET /api/my/transactions returns only the current user's own transactions
    (farmer: transactions on their listings; buyer: transactions on their accepted offers).
    """
    # Deal 1: Farmer A and Buyer A
    listing_1, farmer_a_token, buyer_a_token = create_accepted_deal(client, price=2600.0)

    # Deal 2: Farmer B and Buyer B
    listing_2, farmer_b_token, buyer_b_token = create_accepted_deal(client, price=2700.0)

    # Farmer A should only see Deal 1
    res_farmer_a = client.get(
        "/api/my/transactions",
        headers={"Authorization": f"Bearer {farmer_a_token}"}
    )
    assert res_farmer_a.status_code == 200
    listings_farmer_a = [tx["listing_id"] for tx in res_farmer_a.json()]
    assert listing_1 in listings_farmer_a
    assert listing_2 not in listings_farmer_a

    # Buyer A should only see Deal 1
    res_buyer_a = client.get(
        "/api/my/transactions",
        headers={"Authorization": f"Bearer {buyer_a_token}"}
    )
    assert res_buyer_a.status_code == 200
    listings_buyer_a = [tx["listing_id"] for tx in res_buyer_a.json()]
    assert listing_1 in listings_buyer_a
    assert listing_2 not in listings_buyer_a

    # Buyer B should only see Deal 2
    res_buyer_b = client.get(
        "/api/my/transactions",
        headers={"Authorization": f"Bearer {buyer_b_token}"}
    )
    assert res_buyer_b.status_code == 200
    listings_buyer_b = [tx["listing_id"] for tx in res_buyer_b.json()]
    assert listing_2 in listings_buyer_b
    assert listing_1 not in listings_buyer_b


def test_non_farmer_advance_returns_403(client):
    """
    9. Buyer or other farmer attempting to advance stages returns 403 Forbidden.
    """
    listing_id, _, buyer_token = create_accepted_deal(client, price=2300.0)

    # Buyer tries to advance
    res_buyer = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_pickup"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert res_buyer.status_code == 403

    # Other farmer tries to advance
    other_farmer_phone = str(next(_phone_seq))
    other_farmer_token, _ = get_auth_token(client, other_farmer_phone, "farmer")
    res_other = client.patch(
        f"/api/transactions/{listing_id}/advance",
        json={"action": "confirm_pickup"},
        headers={"Authorization": f"Bearer {other_farmer_token}"}
    )
    assert res_other.status_code == 403
    assert "Forbidden" in res_other.json()["detail"]
