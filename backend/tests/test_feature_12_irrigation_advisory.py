"""
Test Suite: Feature 12 — Water Irrigation Advisory
===================================================
Tests rule-based soil moisture and irrigation urgency estimation using Open-Meteo weather data:
- Recent heavy rainfall -> 'ok' urgency and high moisture percentage
- Hot, dry conditions with no rain -> 'urgent' tier
- Moderate conditions -> 'monitor' tier
- Parameter validation: missing/invalid lat/long -> 422
- Crop validation: unrecognized crop -> 422 with list of 22 valid crops
- Default soil type fallback: missing soil_type -> 200 with loamy default
- Upstream failure handling: Open-Meteo timeout or HTTP error -> 503
All external Open-Meteo HTTP calls are strictly mocked.
"""

from unittest.mock import patch, MagicMock
import pytest
import httpx


def create_mock_open_meteo_response(
    temp: float = 28.0,
    humidity: float = 65.0,
    current_precip: float = 0.0,
    daily_precip: list[float] = None,
    status_code: int = 200
) -> MagicMock:
    """Helper creating a mock httpx.Response matching Open-Meteo's JSON format."""
    mock_resp = MagicMock(spec=httpx.Response)
    mock_resp.status_code = status_code

    if daily_precip is None:
        daily_precip = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    mock_resp.json.return_value = {
        "latitude": 30.9,
        "longitude": 75.85,
        "current": {
            "time": "2026-09-12T07:15",
            "temperature_2m": temp,
            "relative_humidity_2m": humidity,
            "precipitation": current_precip
        },
        "daily": {
            "time": ["2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13", "2026-09-14"],
            "precipitation_sum": daily_precip,
            "temperature_2m_max": [35.0] * 6,
            "temperature_2m_min": [25.0] * 6
        }
    }
    mock_resp.text = "OK"
    return mock_resp


def test_valid_request_heavy_rainfall_returns_ok_urgency_and_high_moisture(client):
    """
    1. A valid request for a location with recent heavy rainfall (e.g. 50mm over past days)
    returns 200 with urgency='ok', moisture level='high', and is_estimate=True.
    """
    # 50mm cumulative rain across past 3 days + today
    mock_response = create_mock_open_meteo_response(
        temp=26.0,
        humidity=85.0,
        daily_precip=[15.0, 20.0, 10.0, 5.0, 0.0, 0.0]
    )

    with patch("app.services.irrigation_service.httpx.get", return_value=mock_response):
        res = client.get(
            "/api/irrigation-advisory",
            params={
                "latitude": 30.90,
                "longitude": 75.85,
                "crop": "rice",
                "soil_type": "alluvial"
            }
        )

        assert res.status_code == 200
        data = res.json()
        assert data["urgency"] == "ok"
        assert data["soil_moisture_level"] == "high"
        assert data["moisture_percent"] >= 60
        assert data["is_estimate"] is True
        assert "Open-Meteo" in data["data_source"]
        assert "rice" in data["crop"].lower()
        assert len(data["tips"]) >= 2
        assert "last_updated" in data


def test_valid_request_dry_hot_weather_returns_urgent_tier(client):
    """
    2. A valid request with high temperature, low humidity, fast-draining sandy soil,
    and 0mm rainfall returns urgency='urgent' and moisture level='low'.
    """
    mock_response = create_mock_open_meteo_response(
        temp=38.0,
        humidity=25.0,
        daily_precip=[0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    )

    with patch("app.services.irrigation_service.httpx.get", return_value=mock_response):
        res = client.get(
            "/api/irrigation-advisory",
            params={
                "latitude": 26.91,
                "longitude": 75.78,
                "crop": "cotton",
                "soil_type": "sandy"
            }
        )

        assert res.status_code == 200
        data = res.json()
        assert data["urgency"] == "urgent"
        assert data["soil_moisture_level"] == "low"
        assert data["moisture_percent"] < 35
        assert "immediate irrigation" in data["recommendation"].lower()
        assert any("sandy" in tip.lower() for tip in data["tips"])


def test_valid_request_moderate_weather_returns_monitor_tier(client):
    """
    3. A valid request with moderate rainfall and standard temperatures
    returns urgency='monitor' and moisture level='medium'.
    """
    mock_response = create_mock_open_meteo_response(
        temp=28.0,
        humidity=60.0,
        daily_precip=[2.0, 3.0, 1.0, 0.0, 0.0, 0.0]
    )

    with patch("app.services.irrigation_service.httpx.get", return_value=mock_response):
        res = client.get(
            "/api/irrigation-advisory",
            params={
                "latitude": 23.02,
                "longitude": 72.57,
                "crop": "maize",
                "soil_type": "loamy"
            }
        )

        assert res.status_code == 200
        data = res.json()
        assert data["urgency"] == "monitor"
        assert data["soil_moisture_level"] == "medium"
        assert 35 <= data["moisture_percent"] < 60
        assert "2–3 days" in data["recommendation"] or "moderate" in data["recommendation"].lower()


def test_missing_or_invalid_coordinates_returns_422(client):
    """
    4. Missing or out-of-range coordinates return HTTP 422 Unprocessable Content.
    """
    # 4a: Missing latitude
    res1 = client.get("/api/irrigation-advisory", params={"longitude": 75.85, "crop": "rice"})
    assert res1.status_code == 422

    # 4b: Missing longitude
    res2 = client.get("/api/irrigation-advisory", params={"latitude": 30.90, "crop": "rice"})
    assert res2.status_code == 422

    # 4c: Latitude out of range (> 90)
    res3 = client.get("/api/irrigation-advisory", params={"latitude": 120.0, "longitude": 75.85, "crop": "rice"})
    assert res3.status_code == 422

    # 4d: Longitude out of range (< -180)
    res4 = client.get("/api/irrigation-advisory", params={"latitude": 30.0, "longitude": -200.0, "crop": "rice"})
    assert res4.status_code == 422


def test_unrecognized_crop_returns_422_with_valid_crops_list(client):
    """
    5. An unrecognized crop (e.g. 'wheat', which is not in the canonical 22 list)
    returns HTTP 422 naming the valid crops list, consistent with Feature 2.
    """
    res = client.get(
        "/api/irrigation-advisory",
        params={
            "latitude": 30.90,
            "longitude": 75.85,
            "crop": "wheat"  # Wheat is intentionally not in the 22-crop model dataset
        }
    )
    assert res.status_code == 422
    data = res.json()
    error_detail = str(data.get("detail", ""))
    assert "not recognized" in error_detail
    assert "rice" in error_detail
    assert "maize" in error_detail


def test_missing_soil_type_falls_back_to_documented_default(client):
    """
    6. When soil_type is omitted, the endpoint defaults gracefully to 'loamy'
    and indicates this in the response.
    """
    mock_response = create_mock_open_meteo_response(
        temp=25.0,
        humidity=65.0,
        daily_precip=[10.0, 10.0, 5.0, 0.0, 0.0, 0.0]
    )

    with patch("app.services.irrigation_service.httpx.get", return_value=mock_response):
        res = client.get(
            "/api/irrigation-advisory",
            params={
                "latitude": 30.90,
                "longitude": 75.85,
                "crop": "chickpea"
                # soil_type omitted
            }
        )

        assert res.status_code == 200
        data = res.json()
        assert "loamy" in data["soil_type"].lower()
        assert "default" in data["soil_type"].lower()


def test_open_meteo_failure_or_timeout_returns_503(client):
    """
    7. When Open-Meteo times out or fails with a network exception,
    the endpoint returns HTTP 503 Service Unavailable with a clean error message.
    """
    # 7a: TimeoutException
    with patch("app.services.irrigation_service.httpx.get", side_effect=httpx.TimeoutException("Connection timed out")):
        res_timeout = client.get(
            "/api/irrigation-advisory",
            params={"latitude": 30.90, "longitude": 75.85, "crop": "rice"}
        )
        assert res_timeout.status_code == 503
        data = res_timeout.json()
        assert data.get("error") == "Weather data unavailable, please try again shortly"

    # 7b: Network RequestError
    with patch("app.services.irrigation_service.httpx.get", side_effect=httpx.ConnectError("Network unreachable")):
        res_error = client.get(
            "/api/irrigation-advisory",
            params={"latitude": 30.90, "longitude": 75.85, "crop": "rice"}
        )
        assert res_error.status_code == 503
        assert res_error.json().get("error") == "Weather data unavailable, please try again shortly"
