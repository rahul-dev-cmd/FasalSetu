"""
Test Suite: Feature 16a — Buyer Company Profile
================================================
Verifies:
1. Creating a buyer profile with valid data (201 Created, verified=True, seeded rating & reviews, avatar initials & color)
2. Creating with an unrecognized tag returns 422 with the valid tag list
3. Creating a second profile for the same buyer returns 409 Conflict
4. Getting own buyer profile returns 200 OK with complete fields
5. Partial update of company_name and tags returns 200 OK and preserves other fields
6. Attempting to alter verified, rating, or review_count via update payload is silently ignored (values remain unchanged)
7. GET /api/buyer-profile/{buyer_user_id} by a farmer returns 200 OK with public fields only (no lat/long)
8. A farmer JWT attempting POST or PUT on /api/buyer-profile returns 403 Forbidden
"""

import pytest
from app.core.constants import AVATAR_PALETTE


def get_user_token(client, phone: str, role: str) -> tuple[str, int]:
    """Helper to register a user via Feature 9/15a and return (jwt_token, user_id)."""
    res = client.post("/api/auth/signup", json={
        "phone": phone,
        "password": "Password123!",
        "role": role,
        "name": f"User {phone}"
    })
    data = res.json()
    return data["access_token"], data["user"]["id"]


def test_create_buyer_profile_success(client):
    """
    1. Create a buyer profile with valid data -> 201 Created, verified=True,
    seeded rating/review_count within documented ranges, and computed avatar fields.
    """
    token, user_id = get_user_token(client, "9820000001", "buyer")
    payload = {
        "company_name": "Shree Balaji Agro Foods",
        "tags": ["Wholesaler", "Immediate Payment"],
        "location": "APMC Vashi, Navi Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777
    }
    response = client.post(
        "/api/buyer-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == user_id
    assert data["company_name"] == "Shree Balaji Agro Foods"
    assert data["tags"] == ["Wholesaler", "Immediate Payment"]
    assert data["location"] == "APMC Vashi, Navi Mumbai"
    assert data["latitude"] == 19.0760
    assert data["longitude"] == 72.8777
    assert data["verified"] is True
    # Verify rating is seeded within 3.5–4.9 with 1 decimal place
    assert 3.5 <= data["rating"] <= 4.9
    assert round(data["rating"], 1) == data["rating"]
    # Verify review count is seeded within 30–150
    assert 30 <= data["review_count"] <= 150
    # Verify derived avatar fields
    assert data["avatar_initial"] == "SB"
    assert data["avatar_color"] in AVATAR_PALETTE


def test_create_buyer_profile_unrecognized_tag(client):
    """
    2. Creating with an unrecognized tag returns 422 with the valid tag list.
    """
    token, _ = get_user_token(client, "9820000002", "buyer")
    payload = {
        "company_name": "Kisan Exports",
        "tags": ["Wholesaler", "Super Fast Delivery"],  # Invalid tag
        "location": "Nashik Mandi"
    }
    response = client.post(
        "/api/buyer-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422
    err_text = str(response.json())
    assert "not recognized" in err_text or "Must be one of" in err_text
    assert "Processor" in err_text
    assert "Immediate Payment" in err_text


def test_create_duplicate_buyer_profile_conflict(client):
    """
    3. Creating a second profile for the same buyer returns 409 Conflict.
    """
    token, _ = get_user_token(client, "9820000003", "buyer")
    payload = {
        "company_name": "Agro Hub Ltd",
        "tags": ["Processor", "Bulk Purchase"],
        "location": "Indore, MP"
    }
    res1 = client.post(
        "/api/buyer-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res1.status_code == 201

    # Attempt second creation
    res2 = client.post(
        "/api/buyer-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()


def test_get_own_buyer_profile_success(client):
    """
    4. Getting own buyer profile returns 200 OK with complete fields.
    """
    token, user_id = get_user_token(client, "9820000004", "buyer")
    payload = {
        "company_name": "Godrej Agrovet",
        "tags": ["Processor", "Good Reputation"],
        "location": "Mumbai, Maharashtra",
        "latitude": 19.0760,
        "longitude": 72.8777
    }
    client.post(
        "/api/buyer-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    response = client.get(
        "/api/buyer-profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert data["company_name"] == "Godrej Agrovet"
    assert data["tags"] == ["Processor", "Good Reputation"]
    assert data["avatar_initial"] == "GA"


def test_update_buyer_profile_partial_success(client):
    """
    5. Partial update of company_name and tags returns 200 OK and preserves location and other fields.
    """
    token, _ = get_user_token(client, "9820000005", "buyer")
    initial_payload = {
        "company_name": "Fresh Farms",
        "tags": ["Wholesaler"],
        "location": "Bengaluru, Karnataka",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    client.post(
        "/api/buyer-profile",
        json=initial_payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    update_payload = {
        "company_name": "Fresh Foods India",
        "tags": ["Retailer", "Immediate Payment"]
    }
    response = client.put(
        "/api/buyer-profile",
        json=update_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Fresh Foods India"
    assert data["tags"] == ["Retailer", "Immediate Payment"]
    # Preserved fields
    assert data["location"] == "Bengaluru, Karnataka"
    assert data["latitude"] == 12.9716
    assert data["longitude"] == 77.5946
    # Avatar initial recomputed
    assert data["avatar_initial"] == "FF"


def test_update_attempt_to_modify_rating_or_verified_silently_ignored(client):
    """
    6. Attempting to set verified, rating, or review_count via PUT update payload
    is silently ignored and has zero effect on the stored values.
    """
    token, _ = get_user_token(client, "9820000006", "buyer")
    initial_payload = {
        "company_name": "Apex Grains",
        "tags": ["Wholesaler", "Bulk Purchase"],
        "location": "Nagpur Mandi"
    }
    create_res = client.post(
        "/api/buyer-profile",
        json=initial_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    initial_verified = created_data["verified"]  # True
    initial_rating = created_data["rating"]
    initial_review_count = created_data["review_count"]

    # Explicitly attempt to tamper with verified, rating, and review_count in the update payload
    tampered_payload = {
        "company_name": "Apex Global Grains",
        "verified": False,
        "rating": 1.2,
        "review_count": 9999
    }
    update_res = client.put(
        "/api/buyer-profile",
        json=tampered_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()

    # Assert company_name was successfully updated
    assert updated_data["company_name"] == "Apex Global Grains"

    # Crucially assert verified, rating, and review_count had ZERO effect
    assert updated_data["verified"] is True
    assert updated_data["verified"] == initial_verified
    assert updated_data["rating"] == initial_rating
    assert updated_data["review_count"] == initial_review_count

    # Double check by fetching profile afresh via GET
    get_res = client.get("/api/buyer-profile", headers={"Authorization": f"Bearer {token}"})
    assert get_res.status_code == 200
    persisted_data = get_res.json()
    assert persisted_data["verified"] is True
    assert persisted_data["rating"] == initial_rating
    assert persisted_data["review_count"] == initial_review_count


def test_get_public_buyer_profile_by_farmer(client):
    """
    7. GET /api/buyer-profile/{buyer_user_id} as a farmer returns 200 OK with public fields only (no lat/long).
    """
    # 1. Create buyer profile
    buyer_token, buyer_id = get_user_token(client, "9820000007", "buyer")
    buyer_payload = {
        "company_name": "Maha Agro Processors",
        "tags": ["Processor", "Immediate Payment"],
        "location": "Kolhapur, Maharashtra",
        "latitude": 16.7050,
        "longitude": 74.2433
    }
    client.post(
        "/api/buyer-profile",
        json=buyer_payload,
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    # 2. Authenticate as a farmer
    farmer_token, _ = get_user_token(client, "9820000008", "farmer")

    # 3. Farmer requests buyer public profile
    response = client.get(
        f"/api/buyer-profile/{buyer_id}",
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert response.status_code == 200
    data = response.json()

    # Public fields present
    assert data["buyer_user_id"] == buyer_id
    assert data["company_name"] == "Maha Agro Processors"
    assert data["avatar_initial"] == "MA"
    assert data["verified"] is True
    assert data["tags"] == ["Processor", "Immediate Payment"]
    assert "rating" in data
    assert "review_count" in data
    assert data["location"] == "Kolhapur, Maharashtra"

    # Private fields (latitude, longitude) strictly omitted from public response
    assert "latitude" not in data
    assert "longitude" not in data


def test_farmer_role_forbidden_on_buyer_profile_writes(client):
    """
    8. A farmer JWT attempting POST or PUT on /api/buyer-profile returns 403 Forbidden.
    """
    farmer_token, _ = get_user_token(client, "9820000009", "farmer")

    # POST attempt by farmer
    post_res = client.post(
        "/api/buyer-profile",
        json={
            "company_name": "Farmer Posing As Buyer",
            "tags": ["Retailer"],
            "location": "Somewhere"
        },
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert post_res.status_code == 403
    assert "buyer" in post_res.json()["detail"].lower()

    # PUT attempt by farmer
    put_res = client.put(
        "/api/buyer-profile",
        json={"company_name": "New Name"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert put_res.status_code == 403
    assert "buyer" in put_res.json()["detail"].lower()
