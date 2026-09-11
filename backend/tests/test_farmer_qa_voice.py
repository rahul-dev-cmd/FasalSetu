"""
Test Suite: Feature 3B — Voice Input for Farmer Q&A Assistant
=============================================================
Tests POST /api/farmer-qa/voice with mocked Groq Whisper transcription and
mocked downstream LLM Q&A. Tests run against in-memory SQLite (zero real API calls).
"""

from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from groq import APIError, APITimeoutError

from app.core.rate_limiter import qa_rate_limiter
from app.models.farmer_qa import FarmerQALog
from app.services.farmer_qa_service import GroqServiceUnavailableException


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Ensure the in-memory rate limiter is empty before each test."""
    qa_rate_limiter.reset()
    yield
    qa_rate_limiter.reset()


# --------------------------------------------------------------------------
# 1. Valid Voice Upload (200 OK)
# --------------------------------------------------------------------------
def test_valid_voice_qa_returns_200(client: TestClient):
    """
    Valid audio upload transcribes speech via Whisper, calls LLM Q&A,
    and returns 200 OK with transcribed_question and guidance.
    """
    mock_transcription = MagicMock()
    mock_transcription.text = "टमाटर में फल छेदक कीट का उपचार क्या है?"

    mock_llm_result = {
        "answer": "टमाटर में फल छेदक के नियंत्रण के लिए नीम तेल का छिड़काव करें।",
        "language_used": "Hindi",
        "disclaimer": "अस्वीकरण: यह सामान्य कृषि सलाह है।",
        "is_farming_related": True,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client, \
         patch("app.services.farmer_qa_service.farmer_qa_service.ask", return_value=mock_llm_result):

        mock_client = MagicMock()
        mock_client.audio.transcriptions.create.return_value = mock_transcription
        mock_get_client.return_value = mock_client

        audio_file = ("question.wav", b"RIFF_FAKE_WAV_BYTES_DATA", "audio/wav")
        response = client.post(
            "/api/farmer-qa/voice",
            files={"audio": audio_file},
            data={"language": "hindi"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["transcribed_question"] == "टमाटर में फल छेदक कीट का उपचार क्या है?"
        assert data["answer"] == "टमाटर में फल छेदक के नियंत्रण के लिए नीम तेल का छिड़काव करें।"
        assert data["language_used"] == "Hindi"
        assert "अस्वीकरण" in data["disclaimer"]
        assert data["is_farming_related"] is True


# --------------------------------------------------------------------------
# 2. Missing Audio File (422)
# --------------------------------------------------------------------------
def test_missing_audio_file_returns_422(client: TestClient):
    """Submitting request without an audio file returns 422 Unprocessable Content."""
    response = client.post(
        "/api/farmer-qa/voice",
        data={"language": "hindi"}
    )
    assert response.status_code == 422
    assert "Audio file is required" in response.json().get("detail", "")


# --------------------------------------------------------------------------
# 3. Empty Audio File (422)
# --------------------------------------------------------------------------
def test_empty_audio_file_returns_422(client: TestClient):
    """Uploading a 0-byte audio file returns 422 with clear message."""
    audio_file = ("empty.mp3", b"", "audio/mpeg")
    response = client.post(
        "/api/farmer-qa/voice",
        files={"audio": audio_file}
    )
    assert response.status_code == 422
    assert "empty" in response.json().get("detail", "").lower()


# --------------------------------------------------------------------------
# 4. Oversized Audio File > 25MB (422)
# --------------------------------------------------------------------------
def test_oversized_audio_file_returns_422(client: TestClient):
    """Uploading an audio file exceeding 25MB limit returns 422."""
    oversized_bytes = b"0" * (25 * 1024 * 1024 + 1024)  # 25 MB + 1 KB
    audio_file = ("large_recording.wav", oversized_bytes, "audio/wav")
    response = client.post(
        "/api/farmer-qa/voice",
        files={"audio": audio_file}
    )
    assert response.status_code == 422
    assert "25MB" in response.json().get("detail", "")


# --------------------------------------------------------------------------
# 5. Unsupported Audio Format (422)
# --------------------------------------------------------------------------
def test_unsupported_audio_format_returns_422(client: TestClient):
    """Uploading unsupported format (e.g. .txt, .pdf) returns 422 naming allowed formats."""
    fake_doc = ("notes.txt", b"Text file content", "text/plain")
    response = client.post(
        "/api/farmer-qa/voice",
        files={"audio": fake_doc}
    )
    assert response.status_code == 422
    assert "Unsupported audio format" in response.json().get("detail", "")
    assert "m4a, mp3, wav, webm" in response.json().get("detail", "")


# --------------------------------------------------------------------------
# 6. Mocked Transcription Failure (503)
# --------------------------------------------------------------------------
def test_transcription_failure_returns_503(client: TestClient):
    """
    When Groq Whisper API fails with an error, the endpoint catches it and
    returns 503 with exact error: 'Voice transcription unavailable, please try again shortly'.
    """
    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_request = MagicMock()
        mock_client.audio.transcriptions.create.side_effect = APIError(
            message="Whisper service unavailable",
            request=mock_request,
            body=None
        )
        mock_get_client.return_value = mock_client

        audio_file = ("question.m4a", b"FAKE_M4A_BYTES", "audio/mp4")
        response = client.post(
            "/api/farmer-qa/voice",
            files={"audio": audio_file}
        )

        assert response.status_code == 503
        assert response.json()["error"] == "Voice transcription unavailable, please try again shortly"


# --------------------------------------------------------------------------
# 7. Mocked Transcription Timeout (503)
# --------------------------------------------------------------------------
def test_transcription_timeout_returns_503(client: TestClient):
    """
    When Groq Whisper times out (>15s), the endpoint returns 503 with
    'Voice transcription unavailable, please try again shortly'.
    """
    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_request = MagicMock()
        mock_client.audio.transcriptions.create.side_effect = APITimeoutError(request=mock_request)
        mock_get_client.return_value = mock_client

        audio_file = ("question.webm", b"FAKE_WEBM_BYTES", "audio/webm")
        response = client.post(
            "/api/farmer-qa/voice",
            files={"audio": audio_file}
        )

        assert response.status_code == 503
        assert response.json()["error"] == "Voice transcription unavailable, please try again shortly"


# --------------------------------------------------------------------------
# 8. Downstream Q&A Failure after Successful Transcription (503)
# --------------------------------------------------------------------------
def test_downstream_qa_failure_returns_503(client: TestClient):
    """
    When transcription succeeds but downstream Q&A fails, returns 503 with
    'Assistant service unavailable, please try again shortly'.
    """
    mock_transcription = MagicMock()
    mock_transcription.text = "What is the best fertilizer for wheat?"

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client, \
         patch("app.services.farmer_qa_service.farmer_qa_service.ask", side_effect=GroqServiceUnavailableException("LLM down")):

        mock_client = MagicMock()
        mock_client.audio.transcriptions.create.return_value = mock_transcription
        mock_get_client.return_value = mock_client

        audio_file = ("question.wav", b"RIFF_FAKE_BYTES", "audio/wav")
        response = client.post(
            "/api/farmer-qa/voice",
            files={"audio": audio_file}
        )

        assert response.status_code == 503
        assert response.json()["error"] == "Assistant service unavailable, please try again shortly"


# --------------------------------------------------------------------------
# 9. Database Logging Records was_voice_input=True
# --------------------------------------------------------------------------
def test_voice_qa_database_logging(client: TestClient, db_session):
    """Verifies voice query is logged to farmer_qa_logs with was_voice_input=True."""
    mock_transcription = MagicMock()
    mock_transcription.text = "How to control stem borer in paddy?"

    mock_llm_result = {
        "answer": "Apply cartap hydrochloride granules at 1 kg a.i./ha.",
        "language_used": "English",
        "disclaimer": "Disclaimer: General advice.",
        "is_farming_related": True,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client, \
         patch("app.services.farmer_qa_service.farmer_qa_service.ask", return_value=mock_llm_result):

        mock_client = MagicMock()
        mock_client.audio.transcriptions.create.return_value = mock_transcription
        mock_get_client.return_value = mock_client

        audio_file = ("stem_borer.mp3", b"FAKE_MP3_DATA", "audio/mpeg")
        response = client.post(
            "/api/farmer-qa/voice",
            files={"audio": audio_file}
        )
        assert response.status_code == 200

        # Query database log
        log_entry = db_session.query(FarmerQALog).filter(
            FarmerQALog.question_text == "How to control stem borer in paddy?"
        ).first()

        assert log_entry is not None
        assert log_entry.was_voice_input is True
        assert log_entry.language_used == "English"
        assert log_entry.was_flagged_offtopic is False
        assert log_entry.groq_model_used == "llama-3.1-8b-instant"


# --------------------------------------------------------------------------
# 10. Rate Limiting Protection (429 Too Many Requests)
# --------------------------------------------------------------------------
def test_voice_rate_limiting_returns_429(client: TestClient):
    """
    Submitting more than 10 voice requests within a minute from the same IP
    triggers HTTP 429 Too Many Requests.
    """
    mock_transcription = MagicMock()
    mock_transcription.text = "Valid agricultural question"

    mock_llm_result = {
        "answer": "Valid guidance",
        "language_used": "English",
        "disclaimer": "Disclaimer",
        "is_farming_related": True,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client, \
         patch("app.services.farmer_qa_service.farmer_qa_service.ask", return_value=mock_llm_result):

        mock_client = MagicMock()
        mock_client.audio.transcriptions.create.return_value = mock_transcription
        mock_get_client.return_value = mock_client

        # Fire 10 requests (allowed)
        for i in range(10):
            audio_file = ("q.wav", b"RIFF_SAMPLE", "audio/wav")
            resp = client.post(
                "/api/farmer-qa/voice",
                files={"audio": audio_file},
                headers={"X-Forwarded-For": "203.0.113.88"}
            )
            assert resp.status_code == 200

        # 11th request must be rejected with 429
        audio_file = ("q.wav", b"RIFF_SAMPLE", "audio/wav")
        resp_blocked = client.post(
            "/api/farmer-qa/voice",
            files={"audio": audio_file},
            headers={"X-Forwarded-For": "203.0.113.88"}
        )
        assert resp_blocked.status_code == 429
        assert "Rate limit exceeded" in resp_blocked.json()["error"]
