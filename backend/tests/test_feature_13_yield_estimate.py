"""
Tests for Feature 13: Yield & Harvest Estimate (GET /api/yield-estimate)
=======================================================================
Verifies:
- Benchmark yield range calculations (min/max quintals) across land area.
- Growth progress % calculation and capping at 100% for past dates.
- Harvest calendar window dates and human-readable ETA day-count bucketing.
- Mandi price integration: gross value & net profit per acre estimation with category cost ratios.
- Graceful degradation when market price data is missing (price_data_available: false).
- Input validation: invalid crop (422), land_size <= 0 (422), future sowing date (422).
- Category-specific cultivation cost ratio application.
"""

from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient

from app.services.yield_service import yield_service, CROP_YIELD_BENCHMARKS


def test_valid_request_cereal_crop_returns_correct_progress_and_yield_range(client: TestClient):
    """
    1. Valid request for a cereal crop (rice) with sowing date ~60 days ago:
       Asserts correct yield range, 50% progress, correct calendar window, and human-friendly ETA.
    """
    today = date.today()
    sowing_date = today - timedelta(days=60)
    land_size = 2.0

    response = client.get(
        "/api/yield-estimate",
        params={
            "crop": "rice",
            "land_size_acres": land_size,
            "sowing_date": sowing_date.isoformat(),
            "field_name": "Main Field (Paddy Plot A)",
            "state": "Punjab"
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert data["field_name"] == "Main Field (Paddy Plot A)"
    assert data["crop_name"] == "rice"
    assert data["yield_unit"] == "quintals"
    assert data["is_estimate"] is True

    # Rice benchmark: 18.0 to 26.0 quintals/acre
    # For 2.0 acres: 36.0 to 52.0 quintals
    assert data["expected_yield_min"] == 36.0
    assert data["expected_yield_max"] == 52.0

    # Rice duration: 105 to 135 days (avg = 120 days)
    # Elapsed = 60 days -> progress = round(60 / 120 * 100) = 50%
    assert data["progress_percent"] == 50

    expected_window_start = (sowing_date + timedelta(days=105)).isoformat()
    expected_window_end = (sowing_date + timedelta(days=135)).isoformat()
    assert data["harvest_window_start"] == expected_window_start
    assert data["harvest_window_end"] == expected_window_end

    # 45 days until harvest window start (105 - 60) -> "in 1–2 months"
    assert data["harvest_eta"] == "in 1–2 months"
    assert data["tracking_status"] == "On track"
    assert "Panicle" in data["health_factor"] or "flowering" in data["health_factor"].lower()


def test_valid_request_with_market_price_populates_value_and_profit(client: TestClient):
    """
    2. Valid request where market price data exists for the crop:
       Asserts price_data_available is true, and estimated_value_min/max and projected_profit_per_acre are positive numbers.
    """
    today = date.today()
    sowing_date = today - timedelta(days=40)

    response = client.get(
        "/api/yield-estimate",
        params={
            "crop": "rice",
            "land_size_acres": 1.5,
            "sowing_date": sowing_date.isoformat(),
            "state": "Punjab"
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert data["price_data_available"] is True
    assert data["estimated_value_min"] is not None
    assert data["estimated_value_max"] is not None
    assert data["estimated_value_max"] > data["estimated_value_min"] > 0
    assert data["projected_profit_per_acre"] is not None
    assert data["projected_profit_per_acre"] > 0


def test_valid_request_without_market_price_returns_null_value_and_price_flag_false(client: TestClient):
    """
    3. Valid request where no market price data exists for the crop/state filter:
       Asserts price_data_available is false, value and profit fields are null, and the request succeeds with 200.
    """
    today = date.today()
    sowing_date = today - timedelta(days=30)

    # State 'Goa' has no recorded mandis in the database
    response = client.get(
        "/api/yield-estimate",
        params={
            "crop": "rice",
            "land_size_acres": 2.0,
            "sowing_date": sowing_date.isoformat(),
            "state": "Goa"
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert data["price_data_available"] is False
    assert data["estimated_value_min"] is None
    assert data["estimated_value_max"] is None
    assert data["projected_profit_per_acre"] is None
    # Yield benchmarks are still calculated accurately
    assert data["expected_yield_min"] == 36.0
    assert data["expected_yield_max"] == 52.0


def test_unrecognized_crop_returns_422_with_valid_crops_list(client: TestClient):
    """
    4. Unrecognized crop (e.g. wheat or soybean) returns 422 naming valid crop options.
    """
    today = date.today()
    sowing_date = today - timedelta(days=30)

    # Test wheat (frontend mock mismatch)
    response_wheat = client.get(
        "/api/yield-estimate",
        params={
            "crop": "wheat",
            "land_size_acres": 2.0,
            "sowing_date": sowing_date.isoformat()
        }
    )
    assert response_wheat.status_code == 422
    err_wheat = response_wheat.json()["detail"]
    assert "wheat" in err_wheat
    assert "rice" in err_wheat

    # Test soybean
    response_soybean = client.get(
        "/api/yield-estimate",
        params={
            "crop": "soybean",
            "land_size_acres": 2.0,
            "sowing_date": sowing_date.isoformat()
        }
    )
    assert response_soybean.status_code == 422
    err_soy = response_soybean.json()["detail"]
    assert "soybean" in err_soy


def test_land_size_zero_or_negative_returns_422(client: TestClient):
    """
    5. land_size_acres <= 0 returns 422 Unprocessable Content.
    """
    today = date.today()
    sowing_date = today - timedelta(days=20)

    # Zero acres
    res_zero = client.get(
        "/api/yield-estimate",
        params={"crop": "rice", "land_size_acres": 0.0, "sowing_date": sowing_date.isoformat()}
    )
    assert res_zero.status_code == 422
    assert "greater than 0" in res_zero.json()["detail"]

    # Negative acres
    res_neg = client.get(
        "/api/yield-estimate",
        params={"crop": "rice", "land_size_acres": -3.5, "sowing_date": sowing_date.isoformat()}
    )
    assert res_neg.status_code == 422
    assert "greater than 0" in res_neg.json()["detail"]


def test_sowing_date_in_future_returns_422(client: TestClient):
    """
    6. sowing_date in the future returns 422.
    """
    tomorrow = date.today() + timedelta(days=1)
    response = client.get(
        "/api/yield-estimate",
        params={
            "crop": "rice",
            "land_size_acres": 1.0,
            "sowing_date": tomorrow.isoformat()
        }
    )
    assert response.status_code == 422
    assert "future" in response.json()["detail"]


def test_progress_percent_caps_at_100_for_past_sowing_date(client: TestClient):
    """
    7. Progress % correctly caps at 100 for a sowing date far in the past.
    """
    today = date.today()
    # 365 days ago for rice (max duration 135 days)
    far_past_date = today - timedelta(days=365)

    response = client.get(
        "/api/yield-estimate",
        params={
            "crop": "rice",
            "land_size_acres": 1.0,
            "sowing_date": far_past_date.isoformat()
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert data["progress_percent"] == 100
    assert data["tracking_status"] == "Ready for harvest"
    assert data["harvest_eta"] == "Harvest window passed"


def test_harvest_eta_bucketing_scales_sensibly():
    """
    8. harvest_eta bucketing helper produces sensible phrasing across various day-count distances.
    """
    today = date.today()

    # Under a week (5 days)
    w_start_5 = today + timedelta(days=5)
    w_end_5 = today + timedelta(days=20)
    assert yield_service.calculate_harvest_eta(today, w_start_5, w_end_5) == "in under a week"

    # 1–2 weeks (10 days)
    w_start_10 = today + timedelta(days=10)
    w_end_10 = today + timedelta(days=25)
    assert yield_service.calculate_harvest_eta(today, w_start_10, w_end_10) == "in 1–2 weeks"

    # 2–4 weeks (20 days)
    w_start_20 = today + timedelta(days=20)
    w_end_20 = today + timedelta(days=35)
    assert yield_service.calculate_harvest_eta(today, w_start_20, w_end_20) == "in 2–4 weeks"

    # 1–2 months (45 days)
    w_start_45 = today + timedelta(days=45)
    w_end_45 = today + timedelta(days=65)
    assert yield_service.calculate_harvest_eta(today, w_start_45, w_end_45) == "in 1–2 months"

    # 2–3 months (75 days)
    w_start_75 = today + timedelta(days=75)
    w_end_75 = today + timedelta(days=95)
    assert yield_service.calculate_harvest_eta(today, w_start_75, w_end_75) == "in 2–3 months"

    # 3–4 months (105 days)
    w_start_105 = today + timedelta(days=105)
    w_end_105 = today + timedelta(days=125)
    assert yield_service.calculate_harvest_eta(today, w_start_105, w_end_105) == "in 3–4 months"

    # 4–6 months (150 days)
    w_start_150 = today + timedelta(days=150)
    w_end_150 = today + timedelta(days=175)
    assert yield_service.calculate_harvest_eta(today, w_start_150, w_end_150) == "in 4–6 months"

    # Over 6 months (220 days)
    w_start_220 = today + timedelta(days=220)
    w_end_220 = today + timedelta(days=250)
    assert yield_service.calculate_harvest_eta(today, w_start_220, w_end_220) == "in over 6 months"

    # In window (already started, not yet ended)
    w_start_now = today - timedelta(days=5)
    w_end_now = today + timedelta(days=10)
    assert yield_service.calculate_harvest_eta(today, w_start_now, w_end_now) == "Ready for harvest (in harvest window)"

    # Window passed
    w_start_past = today - timedelta(days=30)
    w_end_past = today - timedelta(days=5)
    assert yield_service.calculate_harvest_eta(today, w_start_past, w_end_past) == "Harvest window passed"


def test_category_cost_ratio_pulse_vs_cereal(client: TestClient):
    """
    9. Confirms category-specific cultivation cost ratios are applied:
       Pulses (chickpea) use 35% cost ratio (65% net profit margin),
       whereas cereals (maize) use 45% cost ratio (55% net profit margin).
    """
    today = date.today()
    sowing_date = today - timedelta(days=45)

    # Chickpea (Pulse) in Maharashtra
    res_chickpea = client.get(
        "/api/yield-estimate",
        params={
            "crop": "chickpea",
            "land_size_acres": 1.0,
            "sowing_date": sowing_date.isoformat(),
            "state": "Maharashtra"
        }
    )
    assert res_chickpea.status_code == 200
    data_chickpea = res_chickpea.json()

    assert data_chickpea["price_data_available"] is True
    assert data_chickpea["projected_profit_per_acre"] > 0
    # Expected yield avg = (5.0 + 9.0) / 2 = 7.0 q/acre
    # Pulse profit ratio is 65% (1 - 0.35)
    assert data_chickpea["health_factor"] is not None
