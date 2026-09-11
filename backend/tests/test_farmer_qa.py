"""
Tests for Feature 3: Farmer Q&A Assistant
========================================
Validates regional language Q&A, request validation, off-topic handling,
Groq API timeout/failure 503 handling, JSON parsing fallback, rate limiting, and DB logging.
All external Groq API calls are strictly MOCKED (no network calls or API costs during tests).
"""

import pytest
from unittest.mock import patch, MagicMock
from groq import APITimeoutError, APIConnectionError

from app.models.farmer_qa import FarmerQALog
from app.core.rate_limiter import qa_rate_limiter
from app.services.farmer_qa_service import parse_model_json, GroqServiceUnavailableException


@pytest.fixture(autouse=True)
def reset_limiter():
    """Reset rate limiter before each test."""
    qa_rate_limiter.reset()
    yield
    qa_rate_limiter.reset()


def test_valid_farming_question_returns_200(client):
    """
    Test 1: A valid farming question with mocked Groq response returns 200
    with the exact expected response shape.
    """
    mock_result = {
        "answer": "टमाटर के पौधों में फल छेदक कीट से बचाव के लिए 5% नीम के बीज का अर्क (NSKE) छिड़कें।",
        "language_used": "Hindi",
        "disclaimer": "अस्वीकरण: यह सामान्य कृषि सलाह है। गंभीर समस्या पर नजदीकी KVK से संपर्क करें।",
        "is_farming_related": True,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.api.farmer_qa.farmer_qa_service.ask", return_value=mock_result):
        payload = {
            "question": "टमाटर में फल छेदक कीट का उपचार क्या है?",
            "language": "hindi"
        }
        response = client.post("/api/farmer-qa", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert "answer" in data
        assert data["answer"] == mock_result["answer"]
        assert data["language_used"] == "Hindi"
        assert "disclaimer" in data
        assert data["is_farming_related"] is True


def test_missing_or_too_short_question_returns_422(client):
    """
    Test 2: Missing or too-short question returns 422 with clear validation error.
    """
    # 2a: Missing question
    res_missing = client.post("/api/farmer-qa", json={"language": "hindi"})
    assert res_missing.status_code == 422
    assert "question" in str(res_missing.json()).lower()

    # 2b: Too short question (< 3 chars)
    res_short = client.post("/api/farmer-qa", json={"question": "hi"})
    assert res_short.status_code == 422
    assert "at least 3 characters" in str(res_short.json())

    # 2c: Whitespace only
    res_whitespace = client.post("/api/farmer-qa", json={"question": "    "})
    assert res_whitespace.status_code == 422


def test_groq_api_failure_returns_503(client):
    """
    Test 3: Groq API connection failure returns a clean 503, not a fabricated answer.
    """
    with patch("app.api.farmer_qa.farmer_qa_service.ask", side_effect=GroqServiceUnavailableException("Connection failed")):
        payload = {"question": "What fertilizer should I use for wheat?"}
        response = client.post("/api/farmer-qa", json=payload)
        assert response.status_code == 503
        data = response.json()
        assert data == {"error": "Assistant service unavailable, please try again shortly"}


def test_groq_timeout_returns_503(client):
    """
    Test 4 (Fix 2): Groq API call timing out (explicit 15s timeout) returns 503.
    """
    with patch("app.api.farmer_qa.farmer_qa_service.ask", side_effect=GroqServiceUnavailableException("Groq API request timed out")):
        payload = {"question": "How to manage drought stress in cotton?"}
        response = client.post("/api/farmer-qa", json=payload)
        assert response.status_code == 503
        data = response.json()
        assert data == {"error": "Assistant service unavailable, please try again shortly"}


def test_groq_malformed_json_returns_503(client):
    """
    Test 5 (Fix 1): Model returning completely malformed/unparseable text raises
    GroqServiceUnavailableException and returns 503 gracefully.
    """
    with patch("app.api.farmer_qa.farmer_qa_service.ask", side_effect=GroqServiceUnavailableException("Failed to parse structured JSON")):
        payload = {"question": "Best sowing date for mustard in Rajasthan?"}
        response = client.post("/api/farmer-qa", json=payload)
        assert response.status_code == 503
        data = response.json()
        assert data == {"error": "Assistant service unavailable, please try again shortly"}


def test_json_parsing_fallback_strips_markdown_fences():
    """
    Test 6 (Fix 1 Unit): Verifies parse_model_json correctly strips ```json markdown fences.
    """
    markdown_wrapped_json = """```json
    {
      "is_farming_related": true,
      "language_used": "English",
      "answer": "Apply urea in two split doses during first and second irrigation."
    }
    ```"""
    parsed = parse_model_json(markdown_wrapped_json)
    assert parsed["is_farming_related"] is True
    assert parsed["language_used"] == "English"
    assert "Apply urea" in parsed["answer"]

    # Test invalid json triggers GroqServiceUnavailableException
    with pytest.raises(GroqServiceUnavailableException):
        parse_model_json("Sorry, here is some plain text that is not json at all.")


def test_offtopic_question_returns_flagged_response(client):
    """
    Test 7: An off-topic question returns is_farming_related: false with polite redirection.
    """
    mock_offtopic = {
        "answer": "Hello! I am an agricultural advisor for farmers. I can only assist with farming, crop health, pest control, and soil queries. Please ask a farming question!",
        "language_used": "English",
        "disclaimer": "Disclaimer: This is general agricultural guidance.",
        "is_farming_related": False,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.api.farmer_qa.farmer_qa_service.ask", return_value=mock_offtopic):
        payload = {"question": "Who won the cricket match yesterday?"}
        response = client.post("/api/farmer-qa", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["is_farming_related"] is False
        assert "agricultural advisor" in data["answer"].lower() or "farming" in data["answer"].lower()


def test_database_logging_farmer_qa(client, db_session):
    """
    Test 8: A successful call inserts a row into FarmerQALog with correct fields.
    Runs entirely against the isolated in-memory SQLite test database.
    """
    initial_count = db_session.query(FarmerQALog).count()

    mock_result = {
        "answer": "धान की फसल में खैरा रोग जिंक की कमी से होता है। 5 किलो जिंक सल्फेट प्रति हेक्टेयर छिड़कें।",
        "language_used": "Hindi",
        "disclaimer": "अस्वीकरण: यह सामान्य कृषि सलाह है।",
        "is_farming_related": True,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.api.farmer_qa.farmer_qa_service.ask", return_value=mock_result):
        payload = {"question": "धान में खैरा रोग का क्या कारण है?"}
        response = client.post("/api/farmer-qa", json=payload)
        assert response.status_code == 200

        new_count = db_session.query(FarmerQALog).count()
        assert new_count == initial_count + 1

        latest_log = db_session.query(FarmerQALog).order_by(FarmerQALog.id.desc()).first()
        assert latest_log is not None
        assert latest_log.question_text == payload["question"]
        assert latest_log.language_used == "Hindi"
        assert latest_log.response_text == mock_result["answer"]
        assert latest_log.was_flagged_offtopic is False
        assert latest_log.groq_model_used == "llama-3.1-8b-instant"


def test_rate_limiting_returns_429(client):
    """
    Test 9 (Fix 3): Exceeding the rate limit of 10 requests per minute returns 429.
    """
    mock_result = {
        "answer": "Good farming practice.",
        "language_used": "English",
        "disclaimer": "General guidance.",
        "is_farming_related": True,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.api.farmer_qa.farmer_qa_service.ask", return_value=mock_result):
        # 10 requests allowed
        for i in range(10):
            res = client.post("/api/farmer-qa", json={"question": f"Question number {i}?"})
            assert res.status_code == 200

        # 11th request must be rejected with 429
        res_limit = client.post("/api/farmer-qa", json={"question": "Question 11 exceeding limit?"})
        assert res_limit.status_code == 429
        data = res_limit.json()
        assert "rate limit exceeded" in data["error"].lower()
