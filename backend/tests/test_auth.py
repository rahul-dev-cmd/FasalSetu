"""
Tests for Feature 9: Real Authentication for Both Roles (Farmer & Buyer)
========================================================================
Validates phone + password signup, login, JWT issuance, dual-role phone registration,
password hashing security, generic 401 on login failure, and role-based route protection.
"""

import pytest
from fastapi import Depends
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import require_role, get_current_user
from app.models.user import User


# Add a protected test route to app to test role restriction dependency
@app.get("/api/test/farmer-only-route", tags=["Test"])
def farmer_only_test_route(user: User = Depends(require_role("farmer"))):
    return {"message": "Welcome farmer", "user_id": user.id, "role": user.role}


def test_signup_valid_returns_201_and_token(client: TestClient):
    """
    Test 1: Valid signup returns 201 Created with user info and JWT access token.
    Password must NEVER be present in the response.
    """
    payload = {
        "phone": "9876543210",
        "password": "SecurePassword123!",
        "role": "farmer",
        "name": "Ramesh Kumar"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["phone"] == "9876543210"
    assert data["user"]["role"] == "farmer"
    assert data["user"]["name"] == "Ramesh Kumar"
    assert "id" in data["user"]
    # Ensure password or password_hash is never exposed
    assert "password" not in data
    assert "password_hash" not in data
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


def test_signup_duplicate_phone_and_role_returns_409(client: TestClient):
    """
    Test 2: Submitting signup for an already registered (phone, role) returns 409 Conflict.
    """
    payload = {
        "phone": "9876543211",
        "password": "SecurePassword123!",
        "role": "farmer",
        "name": "Suresh Patel"
    }
    res1 = client.post("/api/auth/signup", json=payload)
    assert res1.status_code == 201

    # Second signup with same phone AND same role
    res2 = client.post("/api/auth/signup", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()


def test_signup_same_phone_different_role_succeeds(client: TestClient):
    """
    Test 3: The same phone number can register as BOTH a farmer AND a buyer (dual-role support).
    """
    shared_phone = "9876543212"

    # Register as farmer
    farmer_payload = {
        "phone": shared_phone,
        "password": "FarmerPassword123!",
        "role": "farmer",
        "name": "Dual Role User (Farmer)"
    }
    res_farmer = client.post("/api/auth/signup", json=farmer_payload)
    assert res_farmer.status_code == 201
    assert res_farmer.json()["user"]["role"] == "farmer"

    # Register same phone as buyer
    buyer_payload = {
        "phone": shared_phone,
        "password": "BuyerPassword123!",
        "role": "buyer",
        "name": "Dual Role User (Buyer)"
    }
    res_buyer = client.post("/api/auth/signup", json=buyer_payload)
    assert res_buyer.status_code == 201
    assert res_buyer.json()["user"]["role"] == "buyer"


def test_login_valid_credentials_returns_200_and_token(client: TestClient):
    """
    Test 4: Logging in with valid phone, password, and role returns 200 OK and token.
    """
    signup_payload = {
        "phone": "9876543213",
        "password": "CorrectPassword123!",
        "role": "buyer",
        "name": "Anil Trader"
    }
    client.post("/api/auth/signup", json=signup_payload)

    login_payload = {
        "phone": "9876543213",
        "password": "CorrectPassword123!",
        "role": "buyer"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["phone"] == "9876543213"
    assert data["user"]["role"] == "buyer"


def test_login_wrong_password_returns_401(client: TestClient):
    """
    Test 5: Logging in with wrong password returns 401 Unauthorized with generic message.
    """
    signup_payload = {
        "phone": "9876543214",
        "password": "RealPassword123!",
        "role": "farmer"
    }
    client.post("/api/auth/signup", json=signup_payload)

    login_payload = {
        "phone": "9876543214",
        "password": "WrongPassword!",
        "role": "farmer"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid phone, password, or role"


def test_login_nonexistent_user_returns_401_generic_message(client: TestClient):
    """
    Test 6: Logging in with non-existent phone+role returns 401 with the exact same
    generic message as wrong password to prevent account enumeration / phone leakage.
    """
    login_payload = {
        "phone": "9999999999",
        "password": "AnyPassword123!",
        "role": "farmer"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid phone, password, or role"


def test_protected_route_without_token_returns_401(client: TestClient):
    """
    Test 7: Accessing protected endpoints (/api/auth/me or test route) without a token returns 401.
    """
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "authentication required" in response.json()["detail"].lower()


def test_role_restricted_route_with_wrong_role_returns_403(client: TestClient):
    """
    Test 8: Accessing a role-restricted endpoint (e.g. farmer-only) using a valid buyer token returns 403 Forbidden.
    """
    # 1. Signup a buyer
    buyer_payload = {
        "phone": "9876543215",
        "password": "BuyerPassword123!",
        "role": "buyer"
    }
    res_signup = client.post("/api/auth/signup", json=buyer_payload)
    buyer_token = res_signup.json()["access_token"]

    # 2. Attempt to access farmer-only route with buyer token -> 403
    headers = {"Authorization": f"Bearer {buyer_token}"}
    res_forbidden = client.get("/api/test/farmer-only-route", headers=headers)
    assert res_forbidden.status_code == 403
    assert "farmer" in res_forbidden.json()["detail"].lower()

    # 3. Signup a farmer and access same route -> 200 OK
    farmer_payload = {
        "phone": "9876543216",
        "password": "FarmerPassword123!",
        "role": "farmer"
    }
    res_farmer = client.post("/api/auth/signup", json=farmer_payload)
    farmer_token = res_farmer.json()["access_token"]

    res_allowed = client.get("/api/test/farmer-only-route", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res_allowed.status_code == 200
    assert res_allowed.json()["role"] == "farmer"


def test_signup_invalid_phone_or_short_password_returns_422(client: TestClient):
    """
    Test 9: Invalid phone format (not 10 digits or not starting with 6-9) or short password (< 8 chars) returns 422.
    """
    # 9a: Invalid phone (too short)
    res_short_phone = client.post("/api/auth/signup", json={
        "phone": "12345",
        "password": "ValidPassword123!",
        "role": "farmer"
    })
    assert res_short_phone.status_code == 422

    # 9b: Short password (< 8 chars)
    res_short_pwd = client.post("/api/auth/signup", json={
        "phone": "9876543217",
        "password": "short",
        "role": "farmer"
    })
    assert res_short_pwd.status_code == 422
