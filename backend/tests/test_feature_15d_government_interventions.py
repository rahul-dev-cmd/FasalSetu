"""
Test Suite: Feature 15d — Government Command Center Interventions Management API
================================================================================
Verifies:
1. Seeded interventions listing via GET /api/government/interventions.
2. Filter interventions by status (Pending, In Progress, Completed).
3. Filter interventions by district and issue category.
4. Aggregated statistics endpoint GET /api/government/interventions/stats.
5. Create new intervention as authenticated government user (201 Created).
6. Role-based access control: Farmer and Buyer roles receive 403 Forbidden.
7. Kanban status advancement (Pending -> In Progress -> Completed) with automatic timestamps.
8. Partial field updates via PATCH /api/government/interventions/{id}.
9. Delete intervention via DELETE /api/government/interventions/{id} (204 No Content & 404 on re-fetch).
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.seed_interventions import seed_interventions


@pytest.fixture
def gov_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a government user."""
    signup_payload = {
        "phone": "9800015001",
        "password": "GovPassword123!",
        "role": "government",
        "name": "Intervention Liaison Officer",
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post(
        "/api/auth/login",
        json={
            "phone": "9800015001",
            "password": "GovPassword123!",
            "role": "government",
        },
    )
    return login_resp.json()["access_token"]


@pytest.fixture
def farmer_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a farmer user."""
    signup_payload = {
        "phone": "9800015002",
        "password": "FarmerPassword123!",
        "role": "farmer",
        "name": "Farmer Ramulu",
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post(
        "/api/auth/login",
        json={
            "phone": "9800015002",
            "password": "FarmerPassword123!",
            "role": "farmer",
        },
    )
    return login_resp.json()["access_token"]


@pytest.fixture
def buyer_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a buyer user."""
    signup_payload = {
        "phone": "9800015003",
        "password": "BuyerPassword123!",
        "role": "buyer",
        "name": "Agro Processing Corp",
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post(
        "/api/auth/login",
        json={
            "phone": "9800015003",
            "password": "BuyerPassword123!",
            "role": "buyer",
        },
    )
    return login_resp.json()["access_token"]


@pytest.fixture(autouse=True)
def ensure_interventions_seeded(db_session: Session):
    """Ensure seed interventions are loaded into test db session."""
    seed_interventions(db_session)


def test_seed_and_list_interventions_returns_seeded_count(client: TestClient, gov_token: str):
    """Test 1: GET /api/government/interventions returns all seeded interventions."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/interventions", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 11

    first = data[0]
    assert "id" in first
    assert "district" in first
    assert "mandal" in first
    assert "crop" in first
    assert "title" in first
    assert "status" in first
    assert "affectedHectares" in first or "affected_hectares" in first


def test_filter_interventions_by_status(client: TestClient, gov_token: str):
    """Test 2: Filter by status returns appropriate items."""
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Pending
    p_resp = client.get("/api/government/interventions?status=Pending", headers=headers)
    assert p_resp.status_code == 200
    p_data = p_resp.json()
    assert len(p_data) >= 3
    for item in p_data:
        assert item["status"] == "Pending"

    # In Progress
    ip_resp = client.get("/api/government/interventions?status=In+Progress", headers=headers)
    assert ip_resp.status_code == 200
    ip_data = ip_resp.json()
    assert len(ip_data) >= 4
    for item in ip_data:
        assert item["status"] == "In Progress"

    # Completed
    c_resp = client.get("/api/government/interventions?status=Completed", headers=headers)
    assert c_resp.status_code == 200
    c_data = c_resp.json()
    assert len(c_data) >= 4
    for item in c_data:
        assert item["status"] == "Completed"


def test_filter_interventions_by_district_and_category(client: TestClient, gov_token: str):
    """Test 3: Filter by district and issue category."""
    headers = {"Authorization": f"Bearer {gov_token}"}

    # By district
    w_resp = client.get("/api/government/interventions?district=Warangal", headers=headers)
    assert w_resp.status_code == 200
    w_data = w_resp.json()
    assert len(w_data) >= 1
    assert all(i["district"] == "Warangal" for i in w_data)

    # By category
    cat_resp = client.get("/api/government/interventions?category=Disease", headers=headers)
    assert cat_resp.status_code == 200
    cat_data = cat_resp.json()
    assert len(cat_data) >= 3
    for item in cat_data:
        issue = item.get("issueType") or item.get("issue_type")
        assert issue == "Disease"


def test_get_intervention_stats(client: TestClient, gov_token: str):
    """Test 4: Aggregated statistics calculation."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/interventions/stats", headers=headers)
    assert response.status_code == 200
    stats = response.json()

    assert stats["total_interventions"] >= 11
    assert stats["pending_count"] >= 3
    assert stats["in_progress_count"] >= 4
    assert stats["completed_count"] >= 4
    assert stats["total_affected_hectares"] > 0
    assert stats["total_farmers_impacted"] > 0
    assert stats["teams_deployed_count"] >= 4


def test_create_intervention_as_government_official(client: TestClient, gov_token: str):
    """Test 5: Create a new intervention with auto UID and activity log."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    payload = {
        "district": "Nalgonda",
        "mandal": "Huzurnagar",
        "crop": "Cotton",
        "issue_type": "Pest",
        "risk_level": "High",
        "title": "Aero Spray Requisition for Whitefly",
        "description": "Deploy drone sprayer fleet across 850 hectares in Huzurnagar block.",
        "status": "Pending",
        "team": "Field Team 2",
        "team_lead": "Dr. Srinivas",
        "team_contact": "+91 98492 11452",
        "due_date": "In 3 days",
        "affected_hectares": 850.0,
        "farmers_count": 620,
    }
    response = client.post("/api/government/interventions", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert data["district"] == "Nalgonda"
    assert data["title"] == "Aero Spray Requisition for Whitefly"
    assert data["status"] == "Pending"

    # Verify activity log has initial entry
    act_log = data.get("activityLog") or data.get("activity_log")
    assert len(act_log) >= 1
    assert "Intervention requisition registered" in act_log[0]["text"]


def test_role_restriction_farmer_and_buyer_receive_403(
    client: TestClient, farmer_token: str, buyer_token: str
):
    """Test 6: Farmer and buyer roles receive 403 Forbidden."""
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # Farmer
    f_resp = client.get("/api/government/interventions", headers=farmer_headers)
    assert f_resp.status_code == 403

    f_create = client.post(
        "/api/government/interventions",
        json={"district": "Nalgonda", "title": "Unauthorized"},
        headers=farmer_headers,
    )
    assert f_create.status_code == 403

    # Buyer
    b_resp = client.get("/api/government/interventions", headers=buyer_headers)
    assert b_resp.status_code == 403

    # Unauthenticated
    anon_resp = client.get("/api/government/interventions")
    assert anon_resp.status_code == 401


def test_patch_intervention_status_kanban_drag_drop(client: TestClient, gov_token: str):
    """Test 7: Advance Kanban status and verify automatic field transitions."""
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Advance int-1 from Pending to In Progress
    patch_payload = {
        "status": "In Progress",
        "log_message": "Field squad dispatched from Nalgonda headquarters.",
    }
    resp1 = client.patch(
        "/api/government/interventions/int-1/status",
        json=patch_payload,
        headers=headers,
    )
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["status"] == "In Progress"
    started = data1.get("startedDate") or data1.get("started_date")
    assert started is not None

    # Advance int-1 to Completed
    complete_payload = {
        "status": "Completed",
        "resolved_by": "Rapid Response Squad 1",
        "log_message": "Tricyclazole spraying 100% complete across all 14 mandals.",
    }
    resp2 = client.patch(
        "/api/government/interventions/int-1/status",
        json=complete_payload,
        headers=headers,
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["status"] == "Completed"
    completed = data2.get("completedDate") or data2.get("completed_date")
    assert completed is not None
    resolved = data2.get("resolvedBy") or data2.get("resolved_by")
    assert resolved == "Rapid Response Squad 1"


def test_update_intervention_fields(client: TestClient, gov_token: str):
    """Test 8: General field updates via PATCH."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    update_payload = {
        "team": "Field Team 6",
        "team_lead": "S. Venkat",
        "progress_percent": 75,
        "due_date": "Tomorrow 5 PM",
    }
    response = client.patch(
        "/api/government/interventions/int-2",
        json=update_payload,
        headers=headers,
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["team"] == "Field Team 6"
    prog = updated.get("progressPercent") if "progressPercent" in updated else updated.get("progress_percent")
    assert prog == 75


def test_delete_intervention(client: TestClient, gov_token: str):
    """Test 9: Delete an intervention (204) and ensure subsequent 404."""
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Delete int-3
    del_resp = client.delete("/api/government/interventions/int-3", headers=headers)
    assert del_resp.status_code == 204

    # Verify it is no longer found
    get_resp = client.get("/api/government/interventions/int-3", headers=headers)
    assert get_resp.status_code == 404

    # Delete non-existent ID returns 404
    del_404 = client.delete("/api/government/interventions/non-existent-999", headers=headers)
    assert del_404.status_code == 404
