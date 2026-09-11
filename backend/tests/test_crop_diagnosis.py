"""
Test Suite: Feature 5 — Image-based Crop Diagnosis
==================================================
Tests POST /api/crop-diagnosis with mocked Groq vision model calls.
Tests run against in-memory SQLite (zero external network calls or cloud costs).

Test Cases:
1. Valid image upload returns 200 OK with correct schema.
2. Missing/no image file returns 422.
3. Oversized image file (> 10MB) returns 422.
4. Unsupported image format (.txt, .pdf) returns 422 with allowed extensions named.
5. Mocked vision model timeout/failure returns 503.
6. Mocked model_decommissioned error returns 503 gracefully without crash.
7. Database logging persists all diagnosis attributes to crop_diagnosis_logs.
"""

import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from groq import APIError, APITimeoutError

from app.core.rate_limiter import qa_rate_limiter
from app.models.crop_diagnosis import CropDiagnosisLog


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Ensure in-memory rate limiter is clean before each test."""
    qa_rate_limiter.reset()
    yield
    qa_rate_limiter.reset()


# --------------------------------------------------------------------------
# 1. Valid Image Upload (200 OK)
# --------------------------------------------------------------------------
def test_valid_image_diagnosis_returns_200(client: TestClient):
    """
    Valid crop leaf photo upload calls vision model and returns 200 OK
    with diagnosis, confidence note, treatment, language, disclaimer, and session_id.
    """
    mock_vision_json = {
        "diagnosis": "Early Blight (Alternaria solani) in Tomato",
        "confidence_note": "High confidence based on concentric target-like dark brown spots on lower leaves.",
        "suggested_treatment": "Spray Mancozeb 75% WP @ 2g/liter of water. Prune severely infected lower leaves.",
        "language_used": "English"
    }

    with patch("app.services.crop_diagnosis_service.crop_diagnosis_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(mock_vision_json)
        mock_client.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
        mock_get_client.return_value = mock_client

        fake_image = ("leaf.jpg", b"\xff\xd8\xff\xe0\x00\x10JFIF_FAKE_JPEG_BYTES", "image/jpeg")
        response = client.post(
            "/api/crop-diagnosis",
            files={"image": fake_image},
            data={"question": "What are these spots on my tomato leaf?", "language": "english"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["diagnosis"] == "Early Blight (Alternaria solani) in Tomato"
        assert "target-like dark brown spots" in data["confidence_note"]
        assert "Mancozeb" in data["suggested_treatment"]
        assert data["language_used"] == "English"
        assert "Disclaimer:" in data["disclaimer"]
        assert "session_id" in data
        assert len(data["session_id"]) > 0


# --------------------------------------------------------------------------
# 2. Missing Image File (422)
# --------------------------------------------------------------------------
def test_missing_image_file_returns_422(client: TestClient):
    """Submitting request without an image file returns 422 Unprocessable Content."""
    response = client.post(
        "/api/crop-diagnosis",
        data={"question": "Please diagnose my crop"}
    )
    assert response.status_code == 422
    assert "Image file is required" in response.json().get("detail", "")


# --------------------------------------------------------------------------
# 3. Oversized Image File > 10MB (422)
# --------------------------------------------------------------------------
def test_oversized_image_file_returns_422(client: TestClient):
    """Uploading an image file exceeding 10MB limit returns 422."""
    oversized_bytes = b"0" * (10 * 1024 * 1024 + 1024)  # 10 MB + 1 KB
    fake_image = ("huge_leaf.png", oversized_bytes, "image/png")
    response = client.post(
        "/api/crop-diagnosis",
        files={"image": fake_image}
    )
    assert response.status_code == 422
    assert "10MB" in response.json().get("detail", "")


# --------------------------------------------------------------------------
# 4. Unsupported Image Format (422)
# --------------------------------------------------------------------------
def test_unsupported_image_format_returns_422(client: TestClient):
    """Uploading unsupported format (e.g. .txt, .pdf) returns 422 naming allowed formats."""
    fake_doc = ("notes.pdf", b"%PDF-1.4 fake pdf bytes", "application/pdf")
    response = client.post(
        "/api/crop-diagnosis",
        files={"image": fake_doc}
    )
    assert response.status_code == 422
    assert "Unsupported image format" in response.json().get("detail", "")
    assert "jpg, jpeg, png, webp" in response.json().get("detail", "")


# --------------------------------------------------------------------------
# 5. Mocked Vision Model Failure / Timeout (503)
# --------------------------------------------------------------------------
def test_vision_model_failure_returns_503(client: TestClient):
    """When Groq vision API times out (>15s), returns clean 503 with exact error message."""
    with patch("app.services.crop_diagnosis_service.crop_diagnosis_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_request = MagicMock()
        mock_client.chat.completions.create.side_effect = APITimeoutError(request=mock_request)
        mock_get_client.return_value = mock_client

        fake_image = ("leaf.webp", b"RIFF_FAKE_WEBP_BYTES", "image/webp")
        response = client.post(
            "/api/crop-diagnosis",
            files={"image": fake_image}
        )

        assert response.status_code == 503
        assert response.json()["error"] == "Image diagnosis unavailable, please try again shortly"


# --------------------------------------------------------------------------
# 6. Mocked Model Decommissioned Error (503 Graceful Handling)
# --------------------------------------------------------------------------
def test_vision_model_decommissioned_returns_503(client: TestClient):
    """
    When the configured vision model returns a model_decommissioned or
    model_not_found error from Groq, the endpoint returns 503 gracefully
    without an unhandled crash or 500 error.
    """
    with patch("app.services.crop_diagnosis_service.crop_diagnosis_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_request = MagicMock()
        mock_client.chat.completions.create.side_effect = APIError(
            message="The model 'qwen/qwen3.6-27b' has been decommissioned. Please consult docs for active models.",
            request=mock_request,
            body={"error": {"code": "model_decommissioned"}}
        )
        mock_get_client.return_value = mock_client

        fake_image = ("leaf.jpg", b"FAKE_JPEG_BYTES", "image/jpeg")
        response = client.post(
            "/api/crop-diagnosis",
            files={"image": fake_image}
        )

        assert response.status_code == 503
        assert response.json()["error"] == "Image diagnosis unavailable, please try again shortly"


# --------------------------------------------------------------------------
# 7. Database Logging Records All Fields
# --------------------------------------------------------------------------
def test_crop_diagnosis_database_logging(client: TestClient, db_session):
    """Verifies successful diagnosis is persisted to crop_diagnosis_logs table."""
    mock_vision_json = {
        "diagnosis": "Paddy Blast (Magnaporthe oryzae)",
        "confidence_note": "Spindle-shaped lesions observed with grey centres.",
        "suggested_treatment": "Apply Tricyclazole 75% WP @ 0.6g/liter.",
        "language_used": "Hindi"
    }

    with patch("app.services.crop_diagnosis_service.crop_diagnosis_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(mock_vision_json)
        mock_client.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
        mock_get_client.return_value = mock_client

        fake_image = ("paddy_leaf.png", b"PNG_FAKE_IMAGE_BYTES", "image/png")
        response = client.post(
            "/api/crop-diagnosis",
            files={"image": fake_image},
            data={"question": "धान की पत्ती में धब्बे हैं", "session_id": "session-diag-001"}
        )

        assert response.status_code == 200
        assert response.json()["session_id"] == "session-diag-001"

        # Query database log
        log_entry = db_session.query(CropDiagnosisLog).filter(
            CropDiagnosisLog.session_id == "session-diag-001"
        ).first()

        assert log_entry is not None
        assert log_entry.image_filename == "paddy_leaf.png"
        assert log_entry.question_text == "धान की पत्ती में धब्बे हैं"
        assert log_entry.diagnosis == "Paddy Blast (Magnaporthe oryzae)"
        assert log_entry.language_used == "Hindi"
        assert "अस्वीकरण" in log_entry.disclaimer
        assert "qwen" in log_entry.groq_model_used or "llama" in log_entry.groq_model_used
