"""
Test Suite: Feature 7 — Price Negotiation
=========================================
Tests listings creation, viewing, initial offers, counter-offers,
accept/reject actions, state machine transitions, thread reconstruction,
and validation edge cases.
"""

import pytest
from app.models.crop_listing import CropListing, CropOffer


def test_create_listing_returns_201_and_open_status(client):
    """
    Test 1: Create a listing → 201, correct shape, status defaults to open.
    """
    payload = {
        "crop": "wheat",
        "quantity": 50.0,
        "unit": "quintal",
        "asking_price": 2400.0,
        "farmer_id": "farmer_9876543210"
    }
    response = client.post("/api/listings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["crop"] == "wheat"
    assert data["quantity"] == 50.0
    assert data["unit"] == "quintal"
    assert data["asking_price"] == 2400.0
    assert data["farmer_id"] == "farmer_9876543210"
    assert data["status"] == "open"
    assert "created_at" in data


def test_submit_valid_initial_offer_transitions_listing_to_negotiating(client):
    """
    Test 2: Submit a valid initial offer → 201, listing status becomes negotiating.
    """
    # 1. Create a listing
    listing_res = client.post("/api/listings", json={
        "crop": "rice",
        "quantity": 100.0,
        "unit": "kg",
        "asking_price": 40.0,
        "farmer_id": "farmer_01"
    })
    assert listing_res.status_code == 201
    listing_id = listing_res.json()["id"]

    # 2. Submit initial buyer offer
    offer_payload = {
        "amount": 36.0,
        "made_by": "buyer",
        "buyer_id": "buyer_999",
        "parent_offer_id": None
    }
    offer_res = client.post(f"/api/listings/{listing_id}/offers", json=offer_payload)
    assert offer_res.status_code == 201
    offer_data = offer_res.json()
    assert offer_data["id"] is not None
    assert offer_data["listing_id"] == listing_id
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
    # 1. Create listing and initial offer
    listing = client.post("/api/listings", json={
        "crop": "cotton",
        "quantity": 20.0,
        "unit": "quintal",
        "asking_price": 7200.0,
        "farmer_id": "farmer_cotton"
    }).json()
    listing_id = listing["id"]

    offer = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 7100.0,
        "made_by": "buyer",
        "buyer_id": "buyer_cotton"
    }).json()
    offer_id = offer["id"]

    # 2. Farmer accepts the offer
    patch_res = client.patch(f"/api/listings/{listing_id}/offers/{offer_id}", json={
        "action": "accept"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "accepted"

    # 3. Check listing is marked sold
    detail_res = client.get(f"/api/listings/{listing_id}")
    assert detail_res.json()["status"] == "sold"


def test_farmer_rejects_offer_sets_offer_rejected_and_listing_open(client):
    """
    Test 4: Farmer rejects an offer → offer status rejected, listing stays open/negotiating.
    """
    listing = client.post("/api/listings", json={
        "crop": "maize",
        "quantity": 30.0,
        "unit": "quintal",
        "asking_price": 2100.0,
        "farmer_id": "farmer_maize"
    }).json()
    listing_id = listing["id"]

    offer = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 1500.0,
        "made_by": "buyer",
        "buyer_id": "buyer_lowball"
    }).json()
    offer_id = offer["id"]

    # Farmer rejects the low offer
    patch_res = client.patch(f"/api/listings/{listing_id}/offers/{offer_id}", json={
        "action": "reject"
    })
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
    listing = client.post("/api/listings", json={
        "crop": "mustard",
        "quantity": 15.0,
        "unit": "quintal",
        "asking_price": 5500.0,
        "farmer_id": "farmer_mustard"
    }).json()
    listing_id = listing["id"]

    # Round 1: Buyer offers 5000
    offer_1 = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 5000.0,
        "made_by": "buyer",
        "buyer_id": "buyer_trader"
    }).json()
    assert offer_1["status"] == "pending"

    # Round 2: Farmer counters with 5300
    offer_2 = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 5300.0,
        "made_by": "farmer",
        "buyer_id": "buyer_trader",
        "parent_offer_id": offer_1["id"]
    }).json()
    assert offer_2["status"] == "pending"
    assert offer_2["parent_offer_id"] == offer_1["id"]

    # Round 3: Buyer counters with 5200
    offer_3 = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 5200.0,
        "made_by": "buyer",
        "buyer_id": "buyer_trader",
        "parent_offer_id": offer_2["id"]
    }).json()
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
    listing = client.post("/api/listings", json={
        "crop": "tomato",
        "quantity": 200.0,
        "unit": "kg",
        "asking_price": 25.0,
        "farmer_id": "farmer_tomato"
    }).json()
    listing_id = listing["id"]

    offer_1 = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 18.0,
        "made_by": "buyer",
        "buyer_id": "buyer_tomato"
    }).json()

    # Counter-offer supersedes offer_1
    client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 22.0,
        "made_by": "farmer",
        "buyer_id": "buyer_tomato",
        "parent_offer_id": offer_1["id"]
    })

    # Try to accept offer_1 (now countered/stale)
    stale_action_res = client.patch(f"/api/listings/{listing_id}/offers/{offer_1['id']}", json={
        "action": "accept"
    })
    assert stale_action_res.status_code == 422
    assert "Cannot act on a non-pending or stale offer" in stale_action_res.json()["detail"]


def test_offer_on_sold_or_withdrawn_listing_returns_409(client):
    """
    Test 7: Attempting to offer on a sold or withdrawn listing → 409.
    """
    # Create listing, offer, and accept it so it becomes sold
    listing = client.post("/api/listings", json={
        "crop": "potato",
        "quantity": 500.0,
        "unit": "kg",
        "asking_price": 15.0,
        "farmer_id": "farmer_potato"
    }).json()
    listing_id = listing["id"]

    offer = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 15.0,
        "made_by": "buyer",
        "buyer_id": "buyer_potato"
    }).json()

    client.patch(f"/api/listings/{listing_id}/offers/{offer['id']}", json={
        "action": "accept"
    })

    # Attempt to submit a new offer against the sold listing
    res = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 16.0,
        "made_by": "buyer",
        "buyer_id": "buyer_late"
    })
    assert res.status_code == 409
    assert "sold" in res.json()["detail"]


def test_negative_or_zero_offer_amount_returns_422(client):
    """
    Test 8: Negative or zero offer amount → 422.
    """
    listing = client.post("/api/listings", json={
        "crop": "apple",
        "quantity": 10.0,
        "unit": "box",
        "asking_price": 1200.0,
        "farmer_id": "farmer_apple"
    }).json()
    listing_id = listing["id"]

    # Zero amount
    res_zero = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": 0.0,
        "made_by": "buyer",
        "buyer_id": "buyer_0"
    })
    assert res_zero.status_code == 422

    # Negative amount
    res_neg = client.post(f"/api/listings/{listing_id}/offers", json={
        "amount": -50.0,
        "made_by": "buyer",
        "buyer_id": "buyer_neg"
    })
    assert res_neg.status_code == 422


def test_filter_listings_by_crop_case_insensitive(client):
    """
    Test 9: Listing query filter by crop case-insensitively.
    """
    client.post("/api/listings", json={
        "crop": "watermelon",
        "quantity": 100.0,
        "unit": "kg",
        "asking_price": 20.0,
        "farmer_id": "farmer_wm"
    })

    client.post("/api/listings", json={
        "crop": "pomegranate",
        "quantity": 50.0,
        "unit": "kg",
        "asking_price": 100.0,
        "farmer_id": "farmer_pom"
    })

    # Query by uppercase WATERMELON
    res = client.get("/api/listings?crop=WATERMELON")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1
    assert all(i["crop"] == "watermelon" for i in items)
