"""
Tests for Crop Recommendation & Backend Foundation
=================================================
Validates endpoints, request validation, database logging, and error handling.
Runs strictly against an isolated in-memory SQLite database.
"""

import pytest
from unittest.mock import patch
from app.models.crop_recommendation import CropRecommendationLog


def test_health_check(client):
    """Confirm GET /api/health returns 200 with {'status': 'ok'}."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok"}


def test_valid_crop_recommendation(client):
    """
    Test 1: Valid request returning 200 with exact response shape:
    - recommended_crop: string
    - confidence: float (0 <= c <= 1)
    - alternatives: list of exactly 2 items with 'crop' and 'confidence'
    """
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 42.0,
        "potassium": 43.0,
        "temperature": 20.87,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.93
    }
    response = client.post("/api/crop-recommendation", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify top prediction
    assert "recommended_crop" in data
    assert isinstance(data["recommended_crop"], str)
    assert len(data["recommended_crop"]) > 0
    assert "confidence" in data
    assert isinstance(data["confidence"], (int, float))
    assert 0.0 <= data["confidence"] <= 1.0

    # Verify alternatives
    assert "alternatives" in data
    assert isinstance(data["alternatives"], list)
    assert len(data["alternatives"]) == 2
    for alt in data["alternatives"]:
        assert "crop" in alt
        assert isinstance(alt["crop"], str)
        assert "confidence" in alt
        assert isinstance(alt["confidence"], (int, float))
        assert 0.0 <= alt["confidence"] <= 1.0


def test_invalid_input_ph_returns_422(client):
    """
    Test 2a: Invalid request where pH is outside 0-14 range (ph = 20.0).
    Must return 422 naming which field failed and why.
    """
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 42.0,
        "potassium": 43.0,
        "temperature": 20.87,
        "humidity": 82.0,
        "ph": 20.0,  # Invalid: pH cannot exceed 14
        "rainfall": 202.93
    }
    response = client.post("/api/crop-recommendation", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "errors" in data or "detail" in data
    
    # Check that error details mention "ph"
    error_str = str(data).lower()
    assert "ph" in error_str
    assert "between 0 and 14" in error_str or "14" in error_str


def test_invalid_input_humidity_returns_422(client):
    """
    Test 2b: Invalid request where humidity is outside 0-100 range (humidity = 150.0).
    Must return 422 naming humidity as the failing field.
    """
    payload = {
        "nitrogen": 50.0,
        "phosphorus": 50.0,
        "potassium": 50.0,
        "temperature": 25.0,
        "humidity": 150.0,  # Invalid: humidity cannot exceed 100%
        "ph": 6.5,
        "rainfall": 100.0
    }
    response = client.post("/api/crop-recommendation", json=payload)
    assert response.status_code == 422
    data = response.json()
    error_str = str(data).lower()
    assert "humidity" in error_str


def test_missing_required_field_returns_422(client):
    """
    Test 2c: Missing required field (rainfall missing).
    Must return 422 naming rainfall as the missing field.
    """
    payload = {
        "nitrogen": 50.0,
        "phosphorus": 50.0,
        "potassium": 50.0,
        "temperature": 25.0,
        "humidity": 65.0,
        "ph": 6.5
        # rainfall missing
    }
    response = client.post("/api/crop-recommendation", json=payload)
    assert response.status_code == 422
    data = response.json()
    error_str = str(data).lower()
    assert "rainfall" in error_str


def test_database_logging(client, db_session):
    """
    Test 3: Confirms a row gets inserted into crop_recommendation_logs after a successful call.
    Runs entirely against the isolated in-memory SQLite test database.
    """
    initial_count = db_session.query(CropRecommendationLog).count()

    payload = {
        "nitrogen": 105.0,
        "phosphorus": 55.0,
        "potassium": 50.0,
        "temperature": 26.5,
        "humidity": 78.0,
        "ph": 6.8,
        "rainfall": 110.0
    }
    response = client.post("/api/crop-recommendation", json=payload)
    assert response.status_code == 200
    res_data = response.json()

    # Query the isolated SQLite database directly
    new_count = db_session.query(CropRecommendationLog).count()
    assert new_count == initial_count + 1

    latest_log = (
        db_session.query(CropRecommendationLog)
        .order_by(CropRecommendationLog.id.desc())
        .first()
    )
    assert latest_log is not None
    assert latest_log.nitrogen == 105.0
    assert latest_log.phosphorus == 55.0
    assert latest_log.potassium == 50.0
    assert latest_log.temperature == 26.5
    assert latest_log.humidity == 78.0
    assert latest_log.ph == 6.8
    assert latest_log.rainfall == 110.0
    assert latest_log.recommended_crop == res_data["recommended_crop"]
    assert latest_log.confidence == res_data["confidence"]
    assert isinstance(latest_log.alternatives, list)
    assert len(latest_log.alternatives) == 2


def test_internal_error_handling_returns_500(client):
    """
    Test 4: On any internal error (e.g. predictor unexpected exception),
    endpoint returns 500 with {"error": "..."} without leaking raw stack trace.
    """
    with patch("app.api.crop_recommendation.predictor.predict", side_effect=RuntimeError("Simulated model failure")):
        payload = {
            "nitrogen": 50.0,
            "phosphorus": 50.0,
            "potassium": 50.0,
            "temperature": 25.0,
            "humidity": 65.0,
            "ph": 6.5,
            "rainfall": 100.0
        }
        response = client.post("/api/crop-recommendation", json=payload)
        assert response.status_code == 500
        data = response.json()
        assert "error" in data
        assert "Simulated model failure" not in data["error"]  # Never leak raw internal trace/message
        assert data["error"] == "Failed to generate crop recommendation. Please try again."
