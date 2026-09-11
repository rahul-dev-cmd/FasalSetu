"""
Tests for Feature 8: Answer Feedback Loop
=========================================
Validates feedback submission for Farmer Q&A and Crop Diagnosis logs,
including thumbs up/down validation, comment length validation, 404 for missing logs,
and idempotent overwrite behavior.
"""

from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.models.farmer_qa import FarmerQALog
from app.models.crop_diagnosis import CropDiagnosisLog


def test_submit_valid_feedback_for_qa_log(client: TestClient, db_session: Session):
    """
    Test 1: Submit valid thumbs-up feedback for an existing Q&A log entry.
    Asserts 200 OK, correct response shape, and verification in DB.
    """
    # 1. Create a dummy Q&A log entry
    qa_log = FarmerQALog(
        question_text="धान में तना छेदक का उपाय क्या है?",
        language_used="Hindi",
        response_text="नीम तेल का छिड़काव करें।",
        was_flagged_offtopic=False,
        groq_model_used="llama-3.1-8b-instant",
        was_voice_input=False
    )
    db_session.add(qa_log)
    db_session.commit()
    db_session.refresh(qa_log)

    # 2. Submit feedback
    payload = {
        "log_type": "qa",
        "log_id": qa_log.id,
        "rating": "up",
        "comment": "Very helpful advice, controlled the pests!"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["log_type"] == "qa"
    assert data["log_id"] == qa_log.id
    assert data["rating"] == "up"
    assert data["comment"] == "Very helpful advice, controlled the pests!"
    assert "submitted_at" in data

    # 3. Verify in database
    db_session.refresh(qa_log)
    assert qa_log.feedback_rating == "up"
    assert qa_log.feedback_comment == "Very helpful advice, controlled the pests!"
    assert qa_log.feedback_submitted_at is not None


def test_submit_valid_feedback_for_diagnosis_log(client: TestClient, db_session: Session):
    """
    Test 2: Submit valid thumbs-down feedback with comment for a Crop Diagnosis log entry.
    Asserts 200 OK and correct response shape.
    """
    diag_log = CropDiagnosisLog(
        image_filename="tomato_leaf.jpg",
        diagnosis="Early Blight",
        confidence_note="High confidence",
        suggested_treatment="Spray Mancozeb",
        language_used="English",
        disclaimer="Standard disclaimer",
        groq_model_used="qwen/qwen3.6-27b"
    )
    db_session.add(diag_log)
    db_session.commit()
    db_session.refresh(diag_log)

    payload = {
        "log_type": "diagnosis",
        "log_id": diag_log.id,
        "rating": "down",
        "comment": "Treatment did not work for my crop."
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["log_type"] == "diagnosis"
    assert data["log_id"] == diag_log.id
    assert data["rating"] == "down"
    assert data["comment"] == "Treatment did not work for my crop."
    assert "submitted_at" in data

    # Verify DB
    db_session.refresh(diag_log)
    assert diag_log.feedback_rating == "down"
    assert diag_log.feedback_comment == "Treatment did not work for my crop."
    assert diag_log.feedback_submitted_at is not None


def test_submit_feedback_nonexistent_log_id_returns_404(client: TestClient):
    """
    Test 3: Submitting feedback for a non-existent log_id returns 404 Not Found.
    """
    payload = {
        "log_type": "qa",
        "log_id": 999999,
        "rating": "up"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_submit_feedback_invalid_log_type_returns_422(client: TestClient):
    """
    Test 4: Submitting feedback with invalid log_type (not 'qa' or 'diagnosis') returns 422.
    """
    payload = {
        "log_type": "market",
        "log_id": 1,
        "rating": "up"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 422


def test_submit_feedback_invalid_rating_returns_422(client: TestClient):
    """
    Test 5: Submitting feedback with invalid rating (not 'up' or 'down') returns 422.
    """
    payload = {
        "log_type": "qa",
        "log_id": 1,
        "rating": "sideways"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 422


def test_submit_feedback_comment_too_long_returns_422(client: TestClient):
    """
    Test 6: Submitting feedback with a comment exceeding 500 characters returns 422.
    """
    payload = {
        "log_type": "qa",
        "log_id": 1,
        "rating": "up",
        "comment": "x" * 501
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 422


def test_submit_feedback_overwrite_behavior(client: TestClient, db_session: Session):
    """
    Test 7: Submitting feedback twice for the same log entry overwrites the previous rating
    (idempotent update for correcting accidental taps).
    """
    qa_log = FarmerQALog(
        question_text="गेहूं में खरपतवार नियंत्रण कैसे करें?",
        language_used="Hindi",
        response_text="सल्फोसल्फ्यूरॉन का प्रयोग करें।",
        was_flagged_offtopic=False,
        groq_model_used="llama-3.1-8b-instant",
        was_voice_input=False
    )
    db_session.add(qa_log)
    db_session.commit()
    db_session.refresh(qa_log)

    # First submission: thumbs down
    payload_1 = {
        "log_type": "qa",
        "log_id": qa_log.id,
        "rating": "down",
        "comment": "Accidental dislike"
    }
    res_1 = client.post("/api/feedback", json=payload_1)
    assert res_1.status_code == 200
    assert res_1.json()["rating"] == "down"

    # Second submission: user corrected to thumbs up
    payload_2 = {
        "log_type": "qa",
        "log_id": qa_log.id,
        "rating": "up",
        "comment": "Changed mind, worked very well!"
    }
    res_2 = client.post("/api/feedback", json=payload_2)
    assert res_2.status_code == 200
    data_2 = res_2.json()
    assert data_2["rating"] == "up"
    assert data_2["comment"] == "Changed mind, worked very well!"

    # Database check confirms overwrite
    db_session.refresh(qa_log)
    assert qa_log.feedback_rating == "up"
    assert qa_log.feedback_comment == "Changed mind, worked very well!"


def test_get_feedback_endpoint(client: TestClient, db_session: Session):
    """
    Test 8: GET /api/feedback/{log_type}/{log_id} retrieves recorded feedback.
    """
    qa_log = FarmerQALog(
        question_text="आलू में झुलसा रोग की रोकथाम?",
        language_used="Hindi",
        response_text="कॉपर ऑक्सीक्लोराइड का छिड़काव करें।",
        was_flagged_offtopic=False,
        groq_model_used="llama-3.1-8b-instant",
        was_voice_input=False
    )
    db_session.add(qa_log)
    db_session.commit()
    db_session.refresh(qa_log)

    # Before feedback: 404
    res_not_found = client.get(f"/api/feedback/qa/{qa_log.id}")
    assert res_not_found.status_code == 404

    # Submit feedback
    client.post("/api/feedback", json={
        "log_type": "qa",
        "log_id": qa_log.id,
        "rating": "up",
        "comment": "Great answer"
    })

    # After feedback: 200 OK
    res_get = client.get(f"/api/feedback/qa/{qa_log.id}")
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["log_type"] == "qa"
    assert data["log_id"] == qa_log.id
    assert data["rating"] == "up"
    assert data["comment"] == "Great answer"
