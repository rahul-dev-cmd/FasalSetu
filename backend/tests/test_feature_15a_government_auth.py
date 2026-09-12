"""
Test Suite: Feature 15a — Government Role & Auth Wiring
========================================================
Verifies:
1. Signup with role="government" returns 201 and valid token with role="government"
2. Login with role="government" returns 200 and access token
3. Triple-role coexistence: a farmer, buyer, and government account can all coexist on the same phone number
4. require_role("government") rejects farmer and buyer tokens with 403 Forbidden
5. require_role("government") accepts valid government token with 200 OK
"""

import pytest
from fastapi import Depends
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import require_role
from app.models.user import User


# Protected test route to verify require_role("government")
@app.get("/api/test/government-only-route", tags=["Test"])
def government_only_test_route(user: User = Depends(require_role("government"))):
    return {"message": "Welcome government official", "user_id": user.id, "role": user.role}


def test_government_signup_success(client: TestClient):
    """
    1. Signup with role="government" returns 201 Created with user info and JWT access token.
    """
    payload = {
        "phone": "9812300001",
        "password": "GovPassword123!",
        "role": "government",
        "name": "District Agriculture Officer"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["phone"] == "9812300001"
    assert data["user"]["role"] == "government"
    assert data["user"]["name"] == "District Agriculture Officer"
    assert "password" not in data["user"]


def test_government_login_success(client: TestClient):
    """
    2. Logging in as a government user returns 200 OK and valid JWT token.
    """
    signup_payload = {
        "phone": "9812300002",
        "password": "OfficerSecure123!",
        "role": "government",
        "name": "State Nodal Officer"
    }
    client.post("/api/auth/signup", json=signup_payload)

    login_payload = {
        "phone": "9812300002",
        "password": "OfficerSecure123!",
        "role": "government"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "government"
    assert data["user"]["phone"] == "9812300002"


def test_triple_role_coexistence_on_same_phone(client: TestClient):
    """
    3. A farmer, buyer, and government account can all coexist on the same phone number.
    Each account registers without conflict and logs in independently.
    """
    shared_phone = "9812300003"

    # Register farmer
    res_farmer = client.post("/api/auth/signup", json={
        "phone": shared_phone,
        "password": "FarmerPassword123!",
        "role": "farmer",
        "name": "Farmer Role"
    })
    assert res_farmer.status_code == 201
    assert res_farmer.json()["user"]["role"] == "farmer"

    # Register buyer on same phone
    res_buyer = client.post("/api/auth/signup", json={
        "phone": shared_phone,
        "password": "BuyerPassword123!",
        "role": "buyer",
        "name": "Buyer Role"
    })
    assert res_buyer.status_code == 201
    assert res_buyer.json()["user"]["role"] == "buyer"

    # Register government on same phone
    res_gov = client.post("/api/auth/signup", json={
        "phone": shared_phone,
        "password": "GovPassword123!",
        "role": "government",
        "name": "Gov Role"
    })
    assert res_gov.status_code == 201
    assert res_gov.json()["user"]["role"] == "government"

    # Verify all 3 can log in independently
    for role, pwd in [("farmer", "FarmerPassword123!"), ("buyer", "BuyerPassword123!"), ("government", "GovPassword123!")]:
        login_res = client.post("/api/auth/login", json={
            "phone": shared_phone,
            "password": pwd,
            "role": role
        })
        assert login_res.status_code == 200
        assert login_res.json()["user"]["role"] == role


def test_require_government_role_rejects_farmer_and_buyer(client: TestClient):
    """
    4. require_role("government") correctly rejects farmer and buyer tokens with 403 Forbidden.
    """
    # Create farmer
    res_f = client.post("/api/auth/signup", json={
        "phone": "9812300004",
        "password": "Pass12345!",
        "role": "farmer"
    })
    farmer_token = res_f.json()["access_token"]

    # Create buyer
    res_b = client.post("/api/auth/signup", json={
        "phone": "9812300005",
        "password": "Pass12345!",
        "role": "buyer"
    })
    buyer_token = res_b.json()["access_token"]

    # Farmer token -> 403 Forbidden
    resp_f = client.get("/api/test/government-only-route", headers={"Authorization": f"Bearer {farmer_token}"})
    assert resp_f.status_code == 403
    assert "government" in resp_f.json()["detail"].lower()
    assert "farmer" in resp_f.json()["detail"].lower()

    # Buyer token -> 403 Forbidden
    resp_b = client.get("/api/test/government-only-route", headers={"Authorization": f"Bearer {buyer_token}"})
    assert resp_b.status_code == 403
    assert "government" in resp_b.json()["detail"].lower()
    assert "buyer" in resp_b.json()["detail"].lower()


def test_require_government_role_accepts_government_token(client: TestClient):
    """
    5. require_role("government") correctly accepts a valid government token with 200 OK.
    """
    res_gov = client.post("/api/auth/signup", json={
        "phone": "9812300006",
        "password": "Pass12345!",
        "role": "government",
        "name": "Nodal Officer"
    })
    gov_token = res_gov.json()["access_token"]

    response = client.get("/api/test/government-only-route", headers={"Authorization": f"Bearer {gov_token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome government official"
    assert data["role"] == "government"
