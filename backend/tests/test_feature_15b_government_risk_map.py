"""
Test Suite: Feature 15b — Government Command Center Risk Map & Hotspots API
============================================================================
Verifies:
1. GET /api/government/risk-map/hotspots with no filters -> 200, 17 hotspots, sorted by rank
2. Filter by crop=Rice -> only Rice hotspots returned
3. Filter by risk_level=High -> only High risk hotspots returned
4. time_range=60d and this_season -> correctly selects 60d or 90d trend array
5. GET /api/government/risk-map/hotspots/{id} for valid ID -> 200 with all 3 trends and full interventions_list
6. Invalid hotspot ID -> 404 Not Found
7. Farmer and buyer tokens receive 403 Forbidden on government risk-map endpoints
8. GET /api/government/risk-map/markers and /district-zones -> 200 with correct counts (17 and 11)
9. GET /api/government/risk-map/filters -> 200 with static reference filters
"""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def gov_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a government user."""
    signup_payload = {
        "phone": "9812399991",
        "password": "GovPassword123!",
        "role": "government",
        "name": "Command Center Admin"
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post("/api/auth/login", json={
        "phone": "9812399991",
        "password": "GovPassword123!",
        "role": "government"
    })
    return login_resp.json()["access_token"]


@pytest.fixture
def farmer_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a farmer user."""
    signup_payload = {
        "phone": "9812399992",
        "password": "FarmerPassword123!",
        "role": "farmer",
        "name": "Ramesh Patel"
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post("/api/auth/login", json={
        "phone": "9812399992",
        "password": "FarmerPassword123!",
        "role": "farmer"
    })
    return login_resp.json()["access_token"]


@pytest.fixture
def buyer_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a buyer user."""
    signup_payload = {
        "phone": "9812399993",
        "password": "BuyerPassword123!",
        "role": "buyer",
        "name": "AgriProcure Buyer"
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post("/api/auth/login", json={
        "phone": "9812399993",
        "password": "BuyerPassword123!",
        "role": "buyer"
    })
    return login_resp.json()["access_token"]


def test_get_hotspots_no_filters_returns_all_17_sorted_by_rank(client: TestClient, gov_token: str):
    """
    1. GET /api/government/risk-map/hotspots with no filters returns 200, 17 items, sorted by rank ascending.
    """
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/risk-map/hotspots", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 17

    ranks = [h["rank"] for h in data]
    assert ranks == sorted(ranks)
    assert ranks == list(range(1, 18))

    # Verify essential fields are present in list view
    first = data[0]
    assert "district" in first
    assert "crop" in first
    assert "risk_level" in first
    assert "economic_impact_cr" in first
    assert "historical_trend" in first
    assert "map_position_x" in first
    assert "map_position_y" in first


def test_filter_hotspots_by_crop(client: TestClient, gov_token: str):
    """
    2. Filter by crop=Rice returns only Rice hotspots.
    """
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/risk-map/hotspots?crop=Rice", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for h in data:
        assert h["crop"].lower() == "rice"

    # Case-insensitive verification
    response_lower = client.get("/api/government/risk-map/hotspots?crop=rice", headers=headers)
    assert response_lower.status_code == 200
    assert len(response_lower.json()) == len(data)


def test_filter_hotspots_by_risk_level(client: TestClient, gov_token: str):
    """
    3. Filter by risk_level=High returns only High risk hotspots.
    """
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/risk-map/hotspots?risk_level=High", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    for h in data:
        assert h["risk_level"] == "High"

    # Filter by Low risk
    response_low = client.get("/api/government/risk-map/hotspots?risk_level=low", headers=headers)
    assert response_low.status_code == 200
    assert len(response_low.json()) == 4
    for h in response_low.json():
        assert h["risk_level"] == "Low"


def test_hotspot_time_range_selects_correct_trend_array(client: TestClient, gov_token: str):
    """
    4. time_range=60d returns 60-day trend array, not 30d/90d.
       time_range=this_season returns the 90d trend array.
    """
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Fetch 30d (default)
    resp_30d = client.get("/api/government/risk-map/hotspots?time_range=30d", headers=headers)
    assert resp_30d.status_code == 200
    trend_30d = resp_30d.json()[0]["historical_trend"]

    # Fetch 60d
    resp_60d = client.get("/api/government/risk-map/hotspots?time_range=60d", headers=headers)
    assert resp_60d.status_code == 200
    trend_60d = resp_60d.json()[0]["historical_trend"]

    # Fetch 90d
    resp_90d = client.get("/api/government/risk-map/hotspots?time_range=90d", headers=headers)
    assert resp_90d.status_code == 200
    trend_90d = resp_90d.json()[0]["historical_trend"]

    # Fetch this_season (alias for 90d)
    resp_season = client.get("/api/government/risk-map/hotspots?time_range=this_season", headers=headers)
    assert resp_season.status_code == 200
    trend_season = resp_season.json()[0]["historical_trend"]

    # 60d should differ from 30d and 90d
    assert trend_60d != trend_30d
    assert trend_60d != trend_90d
    # this_season must match 90d
    assert trend_season == trend_90d


def test_get_hotspot_detail_valid_id(client: TestClient, gov_token: str):
    """
    5. GET /api/government/risk-map/hotspots/{id} for a valid ID returns 200,
       including all 3 historical trend ranges and full interventions_list.
    """
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/risk-map/hotspots/1", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == 1
    assert data["rank"] == 1
    assert data["district"] == "Warangal"
    assert "interventions_list" in data
    assert isinstance(data["interventions_list"], list)
    assert len(data["interventions_list"]) >= 3

    assert "historical_trend_30d" in data
    assert "historical_trend_60d" in data
    assert "historical_trend_90d" in data
    assert len(data["historical_trend_30d"]) > 0
    assert len(data["historical_trend_60d"]) > 0
    assert len(data["historical_trend_90d"]) > 0


def test_get_hotspot_detail_invalid_id_returns_404(client: TestClient, gov_token: str):
    """
    6. Invalid hotspot ID returns 404 Not Found.
    """
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/risk-map/hotspots/99999", headers=headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_farmer_and_buyer_tokens_receive_403_forbidden(
    client: TestClient,
    farmer_token: str,
    buyer_token: str
):
    """
    7. A farmer or buyer JWT attempting any /api/government/risk-map/... endpoint returns 403 Forbidden.
    """
    endpoints = [
        "/api/government/risk-map/hotspots",
        "/api/government/risk-map/hotspots/1",
        "/api/government/risk-map/markers",
        "/api/government/risk-map/district-zones",
        "/api/government/risk-map/filters",
    ]

    for ep in endpoints:
        # Farmer token
        f_resp = client.get(ep, headers={"Authorization": f"Bearer {farmer_token}"})
        assert f_resp.status_code == 403, f"Expected 403 for farmer on {ep}, got {f_resp.status_code}"

        # Buyer token
        b_resp = client.get(ep, headers={"Authorization": f"Bearer {buyer_token}"})
        assert b_resp.status_code == 403, f"Expected 403 for buyer on {ep}, got {b_resp.status_code}"

        # Unauthenticated request
        anon_resp = client.get(ep)
        assert anon_resp.status_code in (401, 403), f"Expected 401/403 for anon on {ep}, got {anon_resp.status_code}"


def test_get_markers_and_district_zones_counts(client: TestClient, gov_token: str):
    """
    8. GET /api/government/risk-map/markers and /district-zones return 200 with correct counts (17 and 11).
    """
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Markers
    markers_resp = client.get("/api/government/risk-map/markers", headers=headers)
    assert markers_resp.status_code == 200
    markers = markers_resp.json()
    assert len(markers) == 17
    assert "x" in markers[0]
    assert "y" in markers[0]
    assert "category" in markers[0]
    assert "risk_level" in markers[0]

    # District Zones
    zones_resp = client.get("/api/government/risk-map/district-zones", headers=headers)
    assert zones_resp.status_code == 200
    zones = zones_resp.json()
    assert len(zones) == 11
    assert "name" in zones[0]
    assert "x" in zones[0]
    assert "width" in zones[0]
    assert "bg_class" in zones[0]


def test_get_filters_endpoint(client: TestClient, gov_token: str):
    """
    9. GET /api/government/risk-map/filters returns 200 with static reference options.
    """
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/risk-map/filters", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert "legendCategories" in data
    assert len(data["legendCategories"]) == 4
    assert "cropFilterOptions" in data
    assert len(data["cropFilterOptions"]) >= 6
    assert "riskFilterOptions" in data
    assert "High" in data["riskFilterOptions"]
    assert "timeFilterOptions" in data
    time_ids = [t["id"] for t in data["timeFilterOptions"]]
    assert "30d" in time_ids
    assert "60d" in time_ids
    assert "90d" in time_ids
    assert "this_season" in time_ids
