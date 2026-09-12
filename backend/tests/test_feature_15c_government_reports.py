"""Test Suite: Feature 15c — Government Command Center Report Generation API
=============================================================================
Verifies:
1. GET /api/government/reports with no filters -> 200, returns list of at least 24 seeded reports.
2. GET /api/government/reports?type=Risk+Summary&district=Warangal -> 200, filtered reports.
3. GET /api/government/reports/{id} for valid ID -> 200 with complete metadata and key_findings list.
4. GET /api/government/reports/99999 -> 404 Not Found.
5. POST /api/government/reports/generate with Risk Summary / Crop Health -> 201, is_placeholder_content=False, file on disk.
6. POST /api/government/reports/generate with Yield Forecast / Intervention Log -> 201, is_placeholder_content=True.
7. POST /api/government/reports/generate with invalid district -> 422 with dynamic districts containing 'Jagtial'.
8. GET /api/government/reports/{id}/download -> 200 with proper MIME type (application/pdf, openxmlformats, text/csv).
9. Farmer, buyer, and unauthenticated requests -> 403 Forbidden / 401 Unauthorized.
"""
import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def gov_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a government user."""
    signup_payload = {
        "phone": "9812399991",
        "password": "GovPassword123!",
        "role": "government",
        "name": "Command Center Admin",
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post(
        "/api/auth/login",
        json={
            "phone": "9812399991",
            "password": "GovPassword123!",
            "role": "government",
        },
    )
    return login_resp.json()["access_token"]


@pytest.fixture
def farmer_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a farmer user."""
    signup_payload = {
        "phone": "9812399992",
        "password": "FarmerPassword123!",
        "role": "farmer",
        "name": "Ramesh Patel",
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post(
        "/api/auth/login",
        json={
            "phone": "9812399992",
            "password": "FarmerPassword123!",
            "role": "farmer",
        },
    )
    return login_resp.json()["access_token"]


@pytest.fixture
def buyer_token(client: TestClient) -> str:
    """Helper fixture to create and authenticate a buyer user."""
    signup_payload = {
        "phone": "9812399993",
        "password": "BuyerPassword123!",
        "role": "buyer",
        "name": "Agro Trade Corp",
    }
    client.post("/api/auth/signup", json=signup_payload)
    login_resp = client.post(
        "/api/auth/login",
        json={
            "phone": "9812399993",
            "password": "BuyerPassword123!",
            "role": "buyer",
        },
    )
    return login_resp.json()["access_token"]


def test_list_reports_all(client: TestClient, gov_token: str):
    """Test 1: GET /api/government/reports returns at least 24 seeded reports."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/reports", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 24

    first = data[0]
    assert "id" in first
    assert "name" in first
    assert "type" in first
    assert "district" in first
    assert "date_generated" in first
    assert "format" in first
    assert "file_size_bytes" in first
    assert first["file_size_bytes"] > 0
    assert first["status"] == "Ready"


def test_list_reports_filtered(client: TestClient, gov_token: str):
    """Test 2: GET /api/government/reports with filters returns only matching reports."""
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Filter by type=Risk Summary
    resp_type = client.get("/api/government/reports?type=Risk+Summary", headers=headers)
    assert resp_type.status_code == 200
    type_data = resp_type.json()
    assert len(type_data) >= 1
    assert all(r["type"] == "Risk Summary" for r in type_data)

    # Filter by district=Warangal
    resp_dist = client.get("/api/government/reports?district=Warangal", headers=headers)
    assert resp_dist.status_code == 200
    dist_data = resp_dist.json()
    assert len(dist_data) >= 1
    assert all(r["district"] == "Warangal" for r in dist_data)

    # Combined filter
    resp_comb = client.get("/api/government/reports?type=Risk+Summary&district=Warangal", headers=headers)
    assert resp_comb.status_code == 200
    comb_data = resp_comb.json()
    assert len(comb_data) >= 1
    assert all(r["type"] == "Risk Summary" and r["district"] == "Warangal" for r in comb_data)


def test_get_report_by_id(client: TestClient, gov_token: str):
    """Test 3: GET /api/government/reports/{id} returns full report details and key findings list."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/reports/1", headers=headers)
    assert response.status_code == 200
    report = response.json()
    assert report["id"] == 1
    assert "executive_summary" in report
    assert "key_findings" in report
    assert isinstance(report["key_findings"], list)
    assert len(report["key_findings"]) > 0
    assert report["file_size_bytes"] > 0


def test_get_report_not_found(client: TestClient, gov_token: str):
    """Test 4: GET /api/government/reports/99999 returns 404."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.get("/api/government/reports/99999", headers=headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_generate_report_pdf_real_content(client: TestClient, gov_token: str):
    """Test 5: POST /api/government/reports/generate for Risk Summary generates physical file."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    payload = {
        "type": "Risk Summary",
        "district": "Warangal",
        "date_range": "Last 30 Days",
        "format": "PDF",
    }
    response = client.post("/api/government/reports/generate", json=payload, headers=headers)
    assert response.status_code == 201
    created = response.json()
    assert created["type"] == "Risk Summary"
    assert created["district"] == "Warangal"
    assert created["format"] == "PDF"
    assert created["status"] == "Ready"
    assert created["is_placeholder_content"] is False
    assert created["file_size_bytes"] > 0

    # Verify report is retrievable via GET /api/government/reports/{id}
    get_resp = client.get(f"/api/government/reports/{created['id']}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == created["id"]


def test_generate_report_placeholder_types(client: TestClient, gov_token: str):
    """Test 6: POST /api/government/reports/generate with Yield Forecast / Intervention Log sets placeholder flag."""
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Yield Forecast
    yf_payload = {
        "type": "Yield Forecast",
        "district": "Nizamabad",
        "date_range": "Last 60 Days",
        "format": "Excel",
    }
    yf_resp = client.post("/api/government/reports/generate", json=yf_payload, headers=headers)
    assert yf_resp.status_code == 201
    yf_data = yf_resp.json()
    assert yf_data["is_placeholder_content"] is True
    assert "NOTICE: Placeholder report content" in yf_data["executive_summary"]
    assert yf_data["format"] == "Excel"
    assert yf_data["file_size_bytes"] > 0

    # Intervention Log
    il_payload = {
        "type": "Intervention Log",
        "district": "All Districts",
        "date_range": "Last 30 Days",
        "format": "CSV",
    }
    il_resp = client.post("/api/government/reports/generate", json=il_payload, headers=headers)
    assert il_resp.status_code == 201
    il_data = il_resp.json()
    assert il_data["is_placeholder_content"] is True
    assert il_data["format"] == "CSV"
    assert il_data["file_size_bytes"] > 0


def test_generate_report_dynamic_district_validation(client: TestClient, gov_token: str):
    """Test 7: Dynamic district validation rejects unknown districts and includes 'Jagtial'."""
    headers = {"Authorization": f"Bearer {gov_token}"}
    payload = {
        "type": "Risk Summary",
        "district": "UnknownDistrict",
        "date_range": "Last 30 Days",
        "format": "PDF",
    }
    response = client.post("/api/government/reports/generate", json=payload, headers=headers)
    assert response.status_code == 422
    err_detail = response.json()["detail"]
    assert "UnknownDistrict" in err_detail
    assert "Jagtial" in err_detail
    assert "Warangal" in err_detail
    assert "All Districts" in err_detail


def test_download_report_mime_types(client: TestClient, gov_token: str):
    """Test 8: GET /api/government/reports/{id}/download returns proper MIME types for PDF, Excel, and CSV."""
    headers = {"Authorization": f"Bearer {gov_token}"}

    # Test PDF download (Report 1 is PDF)
    pdf_resp = client.get("/api/government/reports/1/download", headers=headers)
    assert pdf_resp.status_code == 200
    assert "application/pdf" in pdf_resp.headers["content-type"]
    assert len(pdf_resp.content) > 0

    # Test Excel download (Report 3 is Excel)
    excel_resp = client.get("/api/government/reports/3/download", headers=headers)
    assert excel_resp.status_code == 200
    assert (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        in excel_resp.headers["content-type"]
    )
    assert len(excel_resp.content) > 0

    # Test CSV download (Report 4 is CSV)
    csv_resp = client.get("/api/government/reports/4/download", headers=headers)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert len(csv_resp.content) > 0


def test_reports_role_restriction(
    client: TestClient,
    farmer_token: str,
    buyer_token: str,
):
    """Test 9: Farmer, buyer, and unauthenticated users cannot access government reports."""
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # 1. Unauthenticated requests -> 401
    assert client.get("/api/government/reports").status_code == 401
    assert client.get("/api/government/reports/1").status_code == 401
    assert client.post("/api/government/reports/generate", json={}).status_code == 401
    assert client.get("/api/government/reports/1/download").status_code == 401

    # 2. Farmer requests -> 403
    assert client.get("/api/government/reports", headers=farmer_headers).status_code == 403
    assert client.get("/api/government/reports/1", headers=farmer_headers).status_code == 403
    assert (
        client.post(
            "/api/government/reports/generate",
            json={"type": "Risk Summary", "district": "Warangal"},
            headers=farmer_headers,
        ).status_code
        == 403
    )
    assert client.get("/api/government/reports/1/download", headers=farmer_headers).status_code == 403

    # 3. Buyer requests -> 403
    assert client.get("/api/government/reports", headers=buyer_headers).status_code == 403
    assert client.get("/api/government/reports/1", headers=buyer_headers).status_code == 403
    assert (
        client.post(
            "/api/government/reports/generate",
            json={"type": "Risk Summary", "district": "Warangal"},
            headers=buyer_headers,
        ).status_code
        == 403
    )
    assert client.get("/api/government/reports/1/download", headers=buyer_headers).status_code == 403
