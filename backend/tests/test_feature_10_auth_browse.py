"""
Test Suite: Feature 10 — Auth-Wired Price Negotiation & Buyer Marketplace Browse
================================================================================
Verifies real JWT authentication and authorization enforcement on listings & offers,
party-level 403 permissions, default open status browse filtering, and personal views
(GET /api/my/offers and GET /api/my/listings).
"""

import pytest


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


def test_create_listing_without_token_returns_401(client):
    """
    1. Creating a listing without an Authorization header returns 401 Unauthorized.
    """
    payload = {
        "crop": "wheat",
        "quantity": 25.0,
        "unit": "quintal",
        "asking_price": 2200.0,
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]


def test_create_listing_with_buyer_token_returns_403(client):
    """
    2. Creating a listing with a buyer token (wrong role) returns 403 Forbidden.
    """
    buyer_token, _ = get_user_token(client, "9100000001", "buyer")
    payload = {
        "crop": "barley",
        "quantity": 10.0,
        "unit": "quintal",
        "asking_price": 1800.0,
    }
    response = client.post(
        "/api/listings",
        json=payload,
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 403
    assert "farmer" in response.json()["detail"].lower()


def test_create_listing_with_farmer_token_succeeds_and_sets_farmer_id(client):
    """
    3. Creating a listing with a valid farmer token returns 201, and farmer_id
    is derived directly from the token (even if extra fields were sent).
    """
    farmer_token, farmer_id = get_user_token(client, "9100000002", "farmer")
    payload = {
        "crop": "soybean",
        "quantity": 40.0,
        "unit": "quintal",
        "asking_price": 4500.0,
    }
    response = client.post(
        "/api/listings",
        json=payload,
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["farmer_id"] == farmer_id
    assert data["crop"] == "soybean"
    assert data["status"] == "open"


def test_submit_buyer_offer_with_valid_buyer_token(client):
    """
    4. Submitting an initial offer with a valid buyer token returns 201
    and sets buyer_id from current_user.id.
    """
    farmer_token, _ = get_user_token(client, "9100000003", "farmer")
    buyer_token, buyer_id = get_user_token(client, "9100000004", "buyer")

    listing = client.post(
        "/api/listings",
        json={"crop": "onion", "quantity": 100.0, "unit": "kg", "asking_price": 30.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    ).json()

    offer_res = client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 26.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert offer_res.status_code == 201
    data = offer_res.json()
    assert data["buyer_id"] == buyer_id
    assert data["amount"] == 26.0
    assert data["status"] == "pending"


def test_farmer_attempting_to_counter_or_act_on_unowned_listing_returns_403(client):
    """
    5. A farmer attempting to act (counter/accept/reject) on a listing they don't own returns 403.
    """
    farmer1_token, _ = get_user_token(client, "9100000005", "farmer")
    farmer2_token, _ = get_user_token(client, "9100000006", "farmer")
    buyer_token, _ = get_user_token(client, "9100000007", "buyer")

    # Farmer 1 creates listing
    listing = client.post(
        "/api/listings",
        json={"crop": "ginger", "quantity": 50.0, "unit": "kg", "asking_price": 80.0},
        headers={"Authorization": f"Bearer {farmer1_token}"}
    ).json()

    # Buyer makes an offer
    offer = client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 70.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    ).json()

    # Farmer 2 (not the owner) attempts to accept/reject -> 403
    patch_res = client.patch(
        f"/api/listings/{listing['id']}/offers/{offer['id']}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {farmer2_token}"}
    )
    assert patch_res.status_code == 403
    assert "Forbidden" in patch_res.json()["detail"]

    # Farmer 2 attempts to counter -> 403
    counter_res = client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 75.0, "made_by": "farmer", "parent_offer_id": offer["id"]},
        headers={"Authorization": f"Bearer {farmer2_token}"}
    )
    assert counter_res.status_code == 403
    assert "Forbidden" in counter_res.json()["detail"]


def test_different_buyer_attempting_to_accept_reject_or_intervene_returns_403(client):
    """
    6. A different buyer attempting to accept/reject a farmer's counter-offer returns 403.
    """
    farmer_token, _ = get_user_token(client, "9100000008", "farmer")
    buyer1_token, _ = get_user_token(client, "9100000009", "buyer")
    buyer2_token, _ = get_user_token(client, "9100000010", "buyer")

    # Farmer creates listing
    listing = client.post(
        "/api/listings",
        json={"crop": "garlic", "quantity": 30.0, "unit": "kg", "asking_price": 120.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    ).json()

    # Buyer 1 makes initial offer
    offer1 = client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 100.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer1_token}"}
    ).json()

    # Farmer counters Buyer 1
    counter_offer = client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 110.0, "made_by": "farmer", "parent_offer_id": offer1["id"]},
        headers={"Authorization": f"Bearer {farmer_token}"}
    ).json()

    # Buyer 2 attempts to accept the farmer's counter-offer meant for Buyer 1 -> 403
    patch_res = client.patch(
        f"/api/listings/{listing['id']}/offers/{counter_offer['id']}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {buyer2_token}"}
    )
    assert patch_res.status_code == 403
    assert "Forbidden" in patch_res.json()["detail"]

    # Buyer 2 attempts to counter into Buyer 1's negotiation thread -> 403
    counter_by_buyer2 = client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 105.0, "made_by": "buyer", "parent_offer_id": counter_offer["id"]},
        headers={"Authorization": f"Bearer {buyer2_token}"}
    )
    assert counter_by_buyer2.status_code == 403
    assert "Forbidden" in counter_by_buyer2.json()["detail"]


def test_get_my_offers_returns_only_authenticated_buyer_offers(client):
    """
    7. GET /api/my/offers with a buyer token returns only that buyer's offers, not others'.
    """
    farmer_token, _ = get_user_token(client, "9100000011", "farmer")
    buyer1_token, buyer1_id = get_user_token(client, "9100000012", "buyer")
    buyer2_token, buyer2_id = get_user_token(client, "9100000013", "buyer")

    listing = client.post(
        "/api/listings",
        json={"crop": "turmeric", "quantity": 10.0, "unit": "kg", "asking_price": 200.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    ).json()

    # Buyer 1 offers
    client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 180.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer1_token}"}
    )

    # Buyer 2 offers
    client.post(
        f"/api/listings/{listing['id']}/offers",
        json={"amount": 190.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer2_token}"}
    )

    # Buyer 1 queries /api/my/offers
    res1 = client.get("/api/my/offers", headers={"Authorization": f"Bearer {buyer1_token}"})
    assert res1.status_code == 200
    offers1 = res1.json()
    assert len(offers1) >= 1
    assert all(o["buyer_id"] == buyer1_id for o in offers1)
    assert not any(o["buyer_id"] == buyer2_id for o in offers1)

    # Farmer trying to access /api/my/offers -> 403 (wrong role)
    res_farmer = client.get("/api/my/offers", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res_farmer.status_code == 403


def test_get_my_listings_returns_only_authenticated_farmer_listings_with_threads(client):
    """
    8. GET /api/my/listings with a farmer token returns only that farmer's listings,
    each with its complete negotiation thread and round count.
    """
    farmer1_token, farmer1_id = get_user_token(client, "9100000014", "farmer")
    farmer2_token, farmer2_id = get_user_token(client, "9100000015", "farmer")
    buyer_token, _ = get_user_token(client, "9100000016", "buyer")

    # Farmer 1 creates 2 listings
    l1 = client.post(
        "/api/listings",
        json={"crop": "chili", "quantity": 25.0, "unit": "kg", "asking_price": 90.0},
        headers={"Authorization": f"Bearer {farmer1_token}"}
    ).json()
    client.post(
        "/api/listings",
        json={"crop": "coriander", "quantity": 15.0, "unit": "kg", "asking_price": 60.0},
        headers={"Authorization": f"Bearer {farmer1_token}"}
    )

    # Farmer 2 creates 1 listing
    client.post(
        "/api/listings",
        json={"crop": "cardamom", "quantity": 5.0, "unit": "kg", "asking_price": 1500.0},
        headers={"Authorization": f"Bearer {farmer2_token}"}
    )

    # Buyer makes an offer on Farmer 1's listing l1
    client.post(
        f"/api/listings/{l1['id']}/offers",
        json={"amount": 85.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    # Farmer 1 calls /api/my/listings
    res1 = client.get("/api/my/listings", headers={"Authorization": f"Bearer {farmer1_token}"})
    assert res1.status_code == 200
    my_listings = res1.json()
    assert len(my_listings) == 2
    assert all(l["farmer_id"] == farmer1_id for l in my_listings)
    assert not any(l["farmer_id"] == farmer2_id for l in my_listings)

    # Check offer thread on l1
    chili_listing = next(l for l in my_listings if l["id"] == l1["id"])
    assert chili_listing["round_count"] == 1
    assert len(chili_listing["offers"]) == 1
    assert chili_listing["offers"][0]["amount"] == 85.0

    # Buyer trying to access /api/my/listings -> 403 (wrong role)
    res_buyer = client.get("/api/my/listings", headers={"Authorization": f"Bearer {buyer_token}"})
    assert res_buyer.status_code == 403


def test_marketplace_browse_defaults_to_open_status_and_excludes_sold(client):
    """
    9. GET /api/listings defaults to status='open' and excludes sold or withdrawn listings.
    Can explicitly query status='sold' or status='all'.
    """
    farmer_token, _ = get_user_token(client, "9100000017", "farmer")
    buyer_token, _ = get_user_token(client, "9100000018", "buyer")

    # Create listing 1 (remains open)
    client.post(
        "/api/listings",
        json={"crop": "sunflower", "quantity": 50.0, "unit": "kg", "asking_price": 55.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )

    # Create listing 2 and sell it
    l2 = client.post(
        "/api/listings",
        json={"crop": "groundnut", "quantity": 40.0, "unit": "kg", "asking_price": 75.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    ).json()

    offer = client.post(
        f"/api/listings/{l2['id']}/offers",
        json={"amount": 75.0, "made_by": "buyer"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    ).json()

    client.patch(
        f"/api/listings/{l2['id']}/offers/{offer['id']}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )

    # Default browse: should only show open listings (sunflower, not groundnut)
    browse_default = client.get("/api/listings").json()
    assert any(item["crop"] == "sunflower" for item in browse_default)
    assert not any(item["id"] == l2["id"] for item in browse_default)

    # Explicit browse with status=sold: should show groundnut
    browse_sold = client.get("/api/listings?status=sold").json()
    assert any(item["id"] == l2["id"] for item in browse_sold)

    # Explicit browse with status=all: should show both
    browse_all = client.get("/api/listings?status=all").json()
    assert any(item["crop"] == "sunflower" for item in browse_all)
    assert any(item["id"] == l2["id"] for item in browse_all)


def test_submit_offer_without_token_returns_401(client):
    """
    10. POST /api/listings/{id}/offers without token returns 401.
    """
    farmer_token, _ = get_user_token(client, "9100000019", "farmer")
    listing = client.post(
        "/api/listings",
        json={"crop": "cabbage", "quantity": 20.0, "unit": "kg", "asking_price": 18.0},
        headers={"Authorization": f"Bearer {farmer_token}"}
    ).json()

    res = client.post(f"/api/listings/{listing['id']}/offers", json={"amount": 15.0, "made_by": "buyer"})
    assert res.status_code == 401
