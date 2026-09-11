"""
Test Suite: Feature 7 & 10 — Price Negotiation with Real Authentication
======================================================================
Tests listings creation, viewing, initial offers, counter-offers,
accept/reject actions, state machine transitions, thread reconstruction,
and validation edge cases using authenticated JWT bearer tokens.
"""

import pytest


def get_auth_token(client, phone: str, role: str) -> tuple[str, int]:
    """Helper to sign up a user and return (token, user_id)."""
    res = client.post("/api/auth/signup", json={
        "phone": phone,
        "password": "Password123!",
        "role": role,
        "name": f"Test {role.capitalize()}"
    })
    data = res.json()
    return data["access_token"], data["user"]["id"]


def test_create_listing_returns_201_and_open_status(client):
    """
    Test 1: Create a listing with farmer JWT → 201, correct shape, farmer_id derived from token.
    """
    token, farmer_id = get_auth_token(client, "9700000001", "farmer")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "crop": "wheat",
        "quantity": 50.0,
        "unit": "quintal",
        "asking_price": 2400.0,
    }
    response = client.post("/api/listings", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["crop"] == "wheat"
    assert data["quantity"] == 50.0
    assert data["unit"] == "quintal"
    assert data["asking_price"] == 2400.0
    assert data["farmer_id"] == farmer_id
    assert data["status"] == "open"
    assert "created_at" in data


def test_submit_valid_initial_offer_transitions_listing_to_negotiating(client):
    """
    Test 2: Submit a valid initial offer → 201, listing status becomes negotiating.
    """
    f_token, f_id = get_auth_token(client, "9700000002", "farmer")
    b_token, b_id = get_auth_token(client, "9700000003", "buyer")

    # 1. Create a listing
    listing_res = client.post(
        "/api/listings",
        json={
            "crop": "rice",
            "quantity": 100.0,
            "unit": "kg",
            "asking_price": 40.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert listing_res.status_code == 201
    listing_id = listing_res.json()["id"]

    # 2. Submit initial buyer offer
    offer_payload = {
        "amount": 36.0,
        "made_by": "buyer",
        "parent_offer_id": None
    }
    offer_res = client.post(
        f"/api/listings/{listing_id}/offers",
        json=offer_payload,
        headers={"Authorization": f"Bearer {b_token}"}
    )
    assert offer_res.status_code == 201
    offer_data = offer_res.json()
    assert offer_data["id"] is not None
    assert offer_data["listing_id"] == listing_id
    assert offer_data["buyer_id"] == b_id
    assert offer_data["amount"] == 36.0
    assert offer_data["made_by"] == "buyer"
    assert offer_data["status"] == "pending"
    assert offer_data["parent_offer_id"] is None

    # 3. Verify listing status is now 'negotiating'
    detail_res = client.get(f"/api/listings/{listing_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["status"] == "negotiating"


def test_farmer_accepts_offer_sets_offer_accepted_and_listing_sold(client):
    """
    Test 3: Farmer accepts an offer → offer status accepted, listing status sold.
    """
    f_token, _ = get_auth_token(client, "9700000004", "farmer")
    b_token, _ = get_auth_token(client, "9700000005", "buyer")

    # 1. Create listing and initial offer
    listing = client.post(
        "/api/listings",
        json={
            "crop": "cotton",
            "quantity": 20.0,
            "unit": "quintal",
            "asking_price": 7200.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    ).json()
    listing_id = listing["id"]

    offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 7100.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token}"}
    ).json()
    offer_id = offer["id"]

    # 2. Farmer accepts the offer
    patch_res = client.patch(
        f"/api/listings/{listing_id}/offers/{offer_id}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "accepted"

    # 3. Check listing is marked sold
    detail_res = client.get(f"/api/listings/{listing_id}")
    assert detail_res.json()["status"] == "sold"


def test_farmer_rejects_offer_sets_offer_rejected_and_listing_open(client):
    """
    Test 4: Farmer rejects an offer → offer status rejected, listing stays open.
    """
    f_token, _ = get_auth_token(client, "9700000006", "farmer")
    b_token, _ = get_auth_token(client, "9700000007", "buyer")

    listing = client.post(
        "/api/listings",
        json={
            "crop": "maize",
            "quantity": 30.0,
            "unit": "quintal",
            "asking_price": 2100.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    ).json()
    listing_id = listing["id"]

    offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 1500.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token}"}
    ).json()
    offer_id = offer["id"]

    # Farmer rejects the low offer
    patch_res = client.patch(
        f"/api/listings/{listing_id}/offers/{offer_id}",
        json={"action": "reject"},
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "rejected"

    # Listing remains open for other offers
    detail_res = client.get(f"/api/listings/{listing_id}")
    assert detail_res.json()["status"] == "open"


def test_counter_offer_links_to_parent_and_reconstructs_thread_in_order(client):
    """
    Test 5: Counter-offer correctly links to parent_offer_id and the thread
    reconstructs in order via GET /api/listings/{id}.
    """
    f_token, _ = get_auth_token(client, "9700000008", "farmer")
    b_token, _ = get_auth_token(client, "9700000009", "buyer")

    listing = client.post(
        "/api/listings",
        json={
            "crop": "mustard",
            "quantity": 15.0,
            "unit": "quintal",
            "asking_price": 5500.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    ).json()
    listing_id = listing["id"]

    # Round 1: Buyer offers 5000
    offer_1 = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 5000.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token}"}
    ).json()
    assert offer_1["status"] == "pending"

    # Round 2: Farmer counters with 5300
    offer_2 = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 5300.0,
            "made_by": "farmer",
            "parent_offer_id": offer_1["id"]
        },
        headers={"Authorization": f"Bearer {f_token}"}
    ).json()
    assert offer_2["status"] == "pending"
    assert offer_2["parent_offer_id"] == offer_1["id"]

    # Round 3: Buyer counters with 5200
    offer_3 = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 5200.0,
            "made_by": "buyer",
            "parent_offer_id": offer_2["id"]
        },
        headers={"Authorization": f"Bearer {b_token}"}
    ).json()
    assert offer_3["status"] == "pending"
    assert offer_3["parent_offer_id"] == offer_2["id"]

    # Retrieve full thread
    detail = client.get(f"/api/listings/{listing_id}").json()
    assert detail["round_count"] == 3
    offers = detail["offers"]
    assert len(offers) == 3

    # Check chronological ordering and parent linking
    assert offers[0]["id"] == offer_1["id"]
    assert offers[0]["amount"] == 5000.0
    assert offers[0]["status"] == "countered"  # Marked countered by round 2

    assert offers[1]["id"] == offer_2["id"]
    assert offers[1]["amount"] == 5300.0
    assert offers[1]["parent_offer_id"] == offer_1["id"]
    assert offers[1]["status"] == "countered"  # Marked countered by round 3

    assert offers[2]["id"] == offer_3["id"]
    assert offers[2]["amount"] == 5200.0
    assert offers[2]["parent_offer_id"] == offer_2["id"]
    assert offers[2]["status"] == "pending"


def test_act_on_stale_offer_returns_422(client):
    """
    Test 6: Attempting to act on a stale (non-current) offer → 422.
    """
    f_token, _ = get_auth_token(client, "9700000010", "farmer")
    b_token, _ = get_auth_token(client, "9700000011", "buyer")

    listing = client.post(
        "/api/listings",
        json={
            "crop": "tomato",
            "quantity": 200.0,
            "unit": "kg",
            "asking_price": 25.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    ).json()
    listing_id = listing["id"]

    offer_1 = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 18.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token}"}
    ).json()

    # Counter-offer supersedes offer_1
    client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 22.0,
            "made_by": "farmer",
            "parent_offer_id": offer_1["id"]
        },
        headers={"Authorization": f"Bearer {f_token}"}
    )

    # Farmer tries to accept offer_1 (now countered/stale)
    stale_action_res = client.patch(
        f"/api/listings/{listing_id}/offers/{offer_1['id']}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert stale_action_res.status_code == 422
    assert "Cannot act on a non-pending or stale offer" in stale_action_res.json()["detail"]


def test_offer_on_sold_or_withdrawn_listing_returns_409(client):
    """
    Test 7: Attempting to offer on a sold or withdrawn listing → 409.
    """
    f_token, _ = get_auth_token(client, "9700000012", "farmer")
    b_token_1, _ = get_auth_token(client, "9700000013", "buyer")
    b_token_2, _ = get_auth_token(client, "9700000014", "buyer")

    # Create listing, offer, and accept it so it becomes sold
    listing = client.post(
        "/api/listings",
        json={
            "crop": "potato",
            "quantity": 500.0,
            "unit": "kg",
            "asking_price": 15.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    ).json()
    listing_id = listing["id"]

    offer = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 15.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token_1}"}
    ).json()

    client.patch(
        f"/api/listings/{listing_id}/offers/{offer['id']}",
        json={"action": "accept"},
        headers={"Authorization": f"Bearer {f_token}"}
    )

    # Attempt to submit a new offer against the sold listing
    res = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 16.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token_2}"}
    )
    assert res.status_code == 409
    assert "sold" in res.json()["detail"]


def test_negative_or_zero_offer_amount_returns_422(client):
    """
    Test 8: Negative or zero offer amount → 422.
    """
    f_token, _ = get_auth_token(client, "9700000015", "farmer")
    b_token, _ = get_auth_token(client, "9700000016", "buyer")

    listing = client.post(
        "/api/listings",
        json={
            "crop": "apple",
            "quantity": 10.0,
            "unit": "box",
            "asking_price": 1200.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    ).json()
    listing_id = listing["id"]

    # Zero amount
    res_zero = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": 0.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token}"}
    )
    assert res_zero.status_code == 422

    # Negative amount
    res_neg = client.post(
        f"/api/listings/{listing_id}/offers",
        json={
            "amount": -50.0,
            "made_by": "buyer",
        },
        headers={"Authorization": f"Bearer {b_token}"}
    )
    assert res_neg.status_code == 422


def test_filter_listings_by_crop_case_insensitive(client):
    """
    Test 9: Listing query filter by crop case-insensitively.
    """
    f_token, _ = get_auth_token(client, "9700000017", "farmer")

    client.post(
        "/api/listings",
        json={
            "crop": "watermelon",
            "quantity": 100.0,
            "unit": "kg",
            "asking_price": 20.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    )

    client.post(
        "/api/listings",
        json={
            "crop": "pomegranate",
            "quantity": 50.0,
            "unit": "kg",
            "asking_price": 100.0,
        },
        headers={"Authorization": f"Bearer {f_token}"}
    )

    # Query by uppercase WATERMELON
    res = client.get("/api/listings?crop=WATERMELON")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert all(i["crop"] == "watermelon" for i in items)
