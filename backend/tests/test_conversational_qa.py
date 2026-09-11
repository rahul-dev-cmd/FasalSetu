"""
Test Suite: Feature 4 — Conversational Follow-ups (Session Memory)
==================================================================
Tests multi-turn session-scoped conversation memory for both text and voice endpoints:
1. test_first_question_in_new_session: stateless behavior + auto-generated session_id
2. test_followup_question_with_valid_session_injects_history: prior Q&A injected into Groq prompt
3. test_session_id_with_no_prior_history_stateless_fallback: unmatched session_id falls back gracefully
4. test_history_cap_at_three_turns: asserts both (a) exactly 3 turns included, and (b) correct chronological order
5. test_voice_conversational_followup: voice endpoint injects history and preserves session_id
"""

import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.core.rate_limiter import qa_rate_limiter
from app.models.farmer_qa import FarmerQALog


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset rate limiter before each test."""
    qa_rate_limiter.reset()
    yield
    qa_rate_limiter.reset()


# --------------------------------------------------------------------------
# 1. First Question in New Session (Auto-generates session_id, stateless prompt)
# --------------------------------------------------------------------------
def test_first_question_in_new_session(client: TestClient, db_session):
    """
    Request without session_id generates a new session UUID, executes statelessly,
    and returns the session_id for client to use in follow-ups.
    """
    mock_llm_json = {
        "is_farming_related": True,
        "language_used": "Hindi",
        "answer": "गेहूं की बुवाई के लिए नवंबर का पहला पखवाड़ा सबसे उपयुक्त है।"
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(mock_llm_json)
        mock_client.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
        mock_get_client.return_value = mock_client

        response = client.post(
            "/api/farmer-qa",
            json={"question": "गेहूं की बुवाई का सही समय क्या है?"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert len(data["session_id"]) > 0
        assert data["answer"] == mock_llm_json["answer"]

        # Groq prompt must be stateless (no conversation context)
        call_kwargs = mock_client.chat.completions.create.call_args[1]
        user_message = [m["content"] for m in call_kwargs["messages"] if m["role"] == "user"][0]
        assert "Recent Conversation Context:" not in user_message
        assert "Previous Question:" not in user_message
        assert "गेहूं की बुवाई का सही समय क्या है?" in user_message

        # Verify DB logged entry with the generated session_id
        db_log = db_session.query(FarmerQALog).filter(
            FarmerQALog.session_id == data["session_id"]
        ).first()
        assert db_log is not None
        assert db_log.question_text == "गेहूं की बुवाई का सही समय क्या है?"


# --------------------------------------------------------------------------
# 2. Follow-up Question Injects Prior Session History
# --------------------------------------------------------------------------
def test_followup_question_with_valid_session_injects_history(client: TestClient, db_session):
    """
    Providing an existing session_id loads prior Q&A turns from DB and injects them
    into the Groq prompt formatted as Previous Question / Previous Answer pairs.
    """
    session_id = "test-session-followup-123"

    # Seed prior Q&A log in DB
    prior_log = FarmerQALog(
        session_id=session_id,
        question_text="What fertilizer is recommended for wheat?",
        language_used="English",
        response_text="Apply 120 kg Nitrogen, 60 kg Phosphorus, and 40 kg Potassium per hectare.",
        was_flagged_offtopic=False,
        groq_model_used="llama-3.1-8b-instant",
        was_voice_input=False
    )
    db_session.add(prior_log)
    db_session.commit()

    mock_llm_json = {
        "is_farming_related": True,
        "language_used": "English",
        "answer": "Apply half of the Nitrogen at sowing, and the remaining half in two splits."
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(mock_llm_json)
        mock_client.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
        mock_get_client.return_value = mock_client

        response = client.post(
            "/api/farmer-qa",
            json={
                "question": "When should I apply the Nitrogen?",
                "session_id": session_id,
                "language": "english"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id

        # Verify history was injected in Groq call args
        call_kwargs = mock_client.chat.completions.create.call_args[1]
        user_message = [m["content"] for m in call_kwargs["messages"] if m["role"] == "user"][0]
        assert "Recent Conversation Context:" in user_message
        assert "Previous Question: What fertilizer is recommended for wheat?" in user_message
        assert "Previous Answer: Apply 120 kg Nitrogen" in user_message
        assert "Current Farmer's Question: When should I apply the Nitrogen?" in user_message


# --------------------------------------------------------------------------
# 3. Stateless Fallback for Session ID with No Prior History
# --------------------------------------------------------------------------
def test_session_id_with_no_prior_history_stateless_fallback(client: TestClient, db_session):
    """
    If a client passes a session_id with no existing records, it falls back
    gracefully to stateless answering without error, preserving the session_id.
    """
    unmatched_session_id = "non-existent-session-999"

    mock_llm_json = {
        "is_farming_related": True,
        "language_used": "English",
        "answer": "Rotate crops and use Trichoderma viride to treat damping off."
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(mock_llm_json)
        mock_client.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
        mock_get_client.return_value = mock_client

        response = client.post(
            "/api/farmer-qa",
            json={
                "question": "How do I prevent damping off disease in seedlings?",
                "session_id": unmatched_session_id
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == unmatched_session_id

        # Must NOT contain history block
        call_kwargs = mock_client.chat.completions.create.call_args[1]
        user_message = [m["content"] for m in call_kwargs["messages"] if m["role"] == "user"][0]
        assert "Recent Conversation Context:" not in user_message
        assert "Previous Question:" not in user_message
        assert "Farmer's Question: How do I prevent damping off disease in seedlings?" in user_message

        # Should record the new interaction in DB with the unmatched session_id
        db_log = db_session.query(FarmerQALog).filter(
            FarmerQALog.session_id == unmatched_session_id
        ).first()
        assert db_log is not None


# --------------------------------------------------------------------------
# 4. History Capped at 3 Turns & Chronological Order Assertions
# --------------------------------------------------------------------------
def test_history_cap_at_three_turns(client: TestClient, db_session):
    """
    When session has 5 prior turns:
    (a) Assert ONLY the 3 most recent turns (turns 3, 4, 5) are included.
    (b) Assert they appear in correct chronological order (oldest to newest) in Groq call args.
    """
    session_id = "multi-turn-session-cap-555"

    # Seed 5 sequential turns into the DB
    for i in range(1, 6):
        db_log = FarmerQALog(
            session_id=session_id,
            question_text=f"Question Turn {i}: What is step {i}?",
            language_used="English",
            response_text=f"Answer Turn {i}: Step {i} details.",
            was_flagged_offtopic=False,
            groq_model_used="llama-3.1-8b-instant",
            was_voice_input=False
        )
        db_session.add(db_log)
    db_session.commit()

    mock_llm_json = {
        "is_farming_related": True,
        "language_used": "English",
        "answer": "Answer Turn 6: Proceed to harvesting."
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(mock_llm_json)
        mock_client.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
        mock_get_client.return_value = mock_client

        response = client.post(
            "/api/farmer-qa",
            json={
                "question": "Question Turn 6: What is step 6?",
                "session_id": session_id
            }
        )

        assert response.status_code == 200
        call_kwargs = mock_client.chat.completions.create.call_args[1]
        user_message = [m["content"] for m in call_kwargs["messages"] if m["role"] == "user"][0]

        # (a) Assert only 3 turns are included (turns 1 and 2 excluded, 3, 4, 5 included)
        assert "Question Turn 1:" not in user_message
        assert "Question Turn 2:" not in user_message
        assert "Question Turn 3:" in user_message
        assert "Question Turn 4:" in user_message
        assert "Question Turn 5:" in user_message
        assert user_message.count("Previous Question:") == 3
        assert user_message.count("Previous Answer:") == 3

        # (b) Assert turns appear in chronological order (oldest to newest: Turn 3 -> Turn 4 -> Turn 5 -> Current Question)
        idx_turn3 = user_message.index("Question Turn 3:")
        idx_turn4 = user_message.index("Question Turn 4:")
        idx_turn5 = user_message.index("Question Turn 5:")
        idx_turn6 = user_message.index("Question Turn 6:")
        assert idx_turn3 < idx_turn4 < idx_turn5 < idx_turn6


# --------------------------------------------------------------------------
# 5. Voice Conversational Follow-up (POST /api/farmer-qa/voice)
# --------------------------------------------------------------------------
def test_voice_conversational_followup(client: TestClient, db_session):
    """
    Submitting audio with session_id injects prior history into the downstream
    LLM prompt and associates the voice interaction with the same session_id.
    """
    session_id = "voice-session-multi-777"

    # Seed prior Q&A log in DB
    prior_log = FarmerQALog(
        session_id=session_id,
        question_text="What is the sowing time for mustard?",
        language_used="Hindi",
        response_text="सरसों की बुवाई के लिए अक्टूबर से नवंबर का समय सबसे अच्छा होता है।",
        was_flagged_offtopic=False,
        groq_model_used="llama-3.1-8b-instant",
        was_voice_input=False
    )
    db_session.add(prior_log)
    db_session.commit()

    mock_transcription = MagicMock()
    mock_transcription.text = "इसके लिए उन्नत किस्में कौन सी हैं?"

    mock_llm_result = {
        "answer": "सरसों की उन्नत किस्मों में पूसा बोल्ड और आरएच-30 प्रमुख हैं।",
        "language_used": "Hindi",
        "disclaimer": "अस्वीकरण: यह सामान्य कृषि सलाह है।",
        "is_farming_related": True,
        "model_used": "llama-3.1-8b-instant"
    }

    with patch("app.services.farmer_qa_service.farmer_qa_service.get_client") as mock_get_client, \
         patch("app.services.farmer_qa_service.farmer_qa_service.ask", return_value=mock_llm_result) as mock_ask:

        mock_client = MagicMock()
        mock_client.audio.transcriptions.create.return_value = mock_transcription
        mock_get_client.return_value = mock_client

        audio_file = ("question.mp3", b"FAKE_VOICE_DATA", "audio/mpeg")
        response = client.post(
            "/api/farmer-qa/voice",
            files={"audio": audio_file},
            data={"session_id": session_id, "language": "hindi"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["transcribed_question"] == "इसके लिए उन्नत किस्में कौन सी हैं?"

        # Verify farmer_qa_service.ask was called with history containing prior Q&A
        mock_ask.assert_called_once()
        call_kwargs = mock_ask.call_args[1]
        history_arg = call_kwargs.get("history", [])
        assert len(history_arg) == 1
        assert history_arg[0]["question"] == "What is the sowing time for mustard?"

        # Verify DB logged this voice query with was_voice_input=True and same session_id
        db_log = db_session.query(FarmerQALog).filter(
            FarmerQALog.session_id == session_id,
            FarmerQALog.question_text == "इसके लिए उन्नत किस्में कौन सी हैं?"
        ).first()
        assert db_log is not None
        assert db_log.was_voice_input is True
