"""
Test Suite: Feature 14 — Farmer Farm Profile Management & Supported Crops
==========================================================================
Verifies:
1. Creating a valid farm profile via POST /api/farm-profile (201 Created)
2. Rejecting unsupported crops (outside canonical 22) with 422 Unprocessable Entity
3. Rejecting non-positive land sizes (<= 0) with 422 Unprocessable Entity
4. Enforcing 1-to-1 farmer-to-profile relationship via 409 Conflict on duplicate creation
5. Fetching own farm profile via GET /api/farm-profile (200 OK)
6. Fetching uninitialized farm profile returns 404 Not Found
7. Partial updating via PUT /api/farm-profile (200 OK, only targeted fields update)
8. Rejecting invalid enums during update with 422 Unprocessable Entity
9. Enforcing role restriction (role="farmer" required; buyers get 403 Forbidden)
"""

import pytest


def get_user_token(client, phone: str, role: str) -> tuple[str, int]:
    """Helper to register a user via Feature 9 and return (jwt_token, user_id)."""
    res = client.post("/api/auth/signup", json={
        "phone": phone,
        "password": "Password123!",
        "role": role,
        "name": f"User {phone}"
    })
    data = res.json()
    return data["access_token"], data["user"]["id"]


def test_create_farm_profile_success(client):
    """1. Creating a valid profile returns 201 Created and correctly populates all fields."""
    token, user_id = get_user_token(client, "9810000001", "farmer")
    payload = {
        "crop": "rice",
        "land_size": 4.5,
        "land_unit": "acres",
        "location": "Nashik, Maharashtra",
        "latitude": 19.9975,
        "longitude": 73.7898,
        "full_name": "Ramesh Kumar",
        "farming_type": "Organic",
        "soil_type": "Clay loam",
        "preferred_language": "hi",
        "units_preference": "quintals-acres",
        "sms_notifications_enabled": True
    }
    response = client.post(
        "/api/farm-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == user_id
    assert data["crop"] == "rice"
    assert data["land_size"] == 4.5
    assert data["land_unit"] == "acres"
    assert data["location"] == "Nashik, Maharashtra"
    assert data["latitude"] == 19.9975
    assert data["longitude"] == 73.7898
    assert data["full_name"] == "Ramesh Kumar"
    assert data["farming_type"] == "Organic"
    assert data["soil_type"] == "Clay loam"
    assert data["preferred_language"] == "hi"
    assert data["units_preference"] == "quintals-acres"
    assert data["sms_notifications_enabled"] is True
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_farm_profile_invalid_crop(client):
    """2. Creating a profile with a crop outside canonical 22 returns 422 naming valid crops."""
    token, _ = get_user_token(client, "9810000002", "farmer")
    # Verify GET /api/valid-crops helper endpoint returns the canonical 22 crops
    crops_res = client.get("/api/valid-crops")
    assert crops_res.status_code == 200
    valid_crops = crops_res.json()["valid_crops"]
    assert len(valid_crops) == 22
    assert "rice" in valid_crops
    assert "wheat" not in valid_crops

    # Test submitting an unsupported crop (e.g., "Wheat" or "sugarcane")
    payload = {
        "crop": "Wheat",
        "land_size": 2.0,
        "land_unit": "hectares",
        "location": "Punjab, India"
    }
    response = client.post(
        "/api/farm-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422
    err_msg = str(response.json())
    assert "not recognized" in err_msg or "Must be one of" in err_msg


def test_create_farm_profile_invalid_land_size(client):
    """3. Creating a profile with non-positive land size returns 422 Unprocessable Entity."""
    token, _ = get_user_token(client, "9810000003", "farmer")
    payload = {
        "crop": "cotton",
        "land_size": 0.0,
        "land_unit": "acres",
        "location": "Surat, Gujarat"
    }
    response = client.post(
        "/api/farm-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

    # Also test negative number
    payload["land_size"] = -1.5
    response_neg = client.post(
        "/api/farm-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response_neg.status_code == 422


def test_create_duplicate_farm_profile_conflict(client):
    """4. Creating a second profile for the same farmer returns 409 Conflict."""
    token, _ = get_user_token(client, "9810000004", "farmer")
    payload = {
        "crop": "maize",
        "land_size": 3.0,
        "land_unit": "bigha",
        "location": "Jaipur, Rajasthan"
    }
    first_res = client.post(
        "/api/farm-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert first_res.status_code == 201

    # Attempt second profile creation for the same authenticated user
    second_res = client.post(
        "/api/farm-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert second_res.status_code == 409
    assert "already exists" in second_res.json()["detail"].lower()


def test_get_farm_profile_success(client):
    """5. Fetching own profile returns 200 OK and accurate profile data."""
    token, user_id = get_user_token(client, "9810000005", "farmer")
    payload = {
        "crop": "coffee",
        "land_size": 12.0,
        "land_unit": "acres",
        "location": "Coorg, Karnataka",
        "farming_type": "Conventional",
        "units_preference": "kg-hectares"
    }
    client.post(
        "/api/farm-profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    response = client.get(
        "/api/farm-profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert data["crop"] == "coffee"
    assert data["land_size"] == 12.0
    assert data["land_unit"] == "acres"
    assert data["location"] == "Coorg, Karnataka"
    assert data["farming_type"] == "Conventional"
    assert data["units_preference"] == "kg-hectares"


def test_get_farm_profile_not_found(client):
    """6. Fetching farm profile when none exists returns 404 Not Found."""
    token, _ = get_user_token(client, "9810000006", "farmer")
    response = client.get(
        "/api/farm-profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_farm_profile_partial_success(client):
    """7. Updating profile via PUT modifies only specified fields, preserving the rest."""
    token, _ = get_user_token(client, "9810000007", "farmer")
    initial_payload = {
        "crop": "banana",
        "land_size": 2.5,
        "land_unit": "acres",
        "location": "Jalgaon, Maharashtra",
        "farming_type": "Conventional",
        "soil_type": "Alluvial soil",
        "sms_notifications_enabled": True
    }
    create_res = client.post(
        "/api/farm-profile",
        json=initial_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert create_res.status_code == 201

    # Partial update: change only soil_type and sms_notifications_enabled
    update_payload = {
        "soil_type": "Black soil",
        "sms_notifications_enabled": False
    }
    update_res = client.put(
        "/api/farm-profile",
        json=update_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_res.status_code == 200
    data = update_res.json()
    # Updated fields
    assert data["soil_type"] == "Black soil"
    assert data["sms_notifications_enabled"] is False
    # Unchanged fields preserved
    assert data["crop"] == "banana"
    assert data["land_size"] == 2.5
    assert data["land_unit"] == "acres"
    assert data["location"] == "Jalgaon, Maharashtra"
    assert data["farming_type"] == "Conventional"


def test_update_farm_profile_invalid_enum(client):
    """8. Updating profile with invalid enum value returns 422 Unprocessable Entity."""
    token, _ = get_user_token(client, "9810000008", "farmer")
    initial_payload = {
        "crop": "mango",
        "land_size": 5.0,
        "land_unit": "acres",
        "location": "Ratnagiri, Maharashtra"
    }
    client.post(
        "/api/farm-profile",
        json=initial_payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    # Invalid land unit "sqft" (only acres, hectares, bigha allowed)
    bad_unit_res = client.put(
        "/api/farm-profile",
        json={"land_unit": "sqft"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert bad_unit_res.status_code == 422

    # Invalid farming_type "Biodynamic" (only Organic, Conventional allowed)
    bad_type_res = client.put(
        "/api/farm-profile",
        json={"farming_type": "Biodynamic"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert bad_type_res.status_code == 422


def test_buyer_token_access_forbidden(client):
    """9. Non-farmer roles (buyers) receive 403 Forbidden on farm profile endpoints."""
    buyer_token, _ = get_user_token(client, "9810000009", "buyer")

    # POST attempt
    post_res = client.post(
        "/api/farm-profile",
        json={
            "crop": "rice",
            "land_size": 1.0,
            "land_unit": "acres",
            "location": "Delhi"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert post_res.status_code == 403
    assert "farmer" in post_res.json()["detail"].lower()

    # GET attempt
    get_res = client.get(
        "/api/farm-profile",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert get_res.status_code == 403
    assert "farmer" in get_res.json()["detail"].lower()

    # PUT attempt
    put_res = client.put(
        "/api/farm-profile",
        json={"land_size": 2.0},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert put_res.status_code == 403
    assert "farmer" in put_res.json()["detail"].lower()
