import os
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, Request, status, File, UploadFile, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.constants import MAX_CONVERSATION_HISTORY
from app.core.rate_limiter import qa_rate_limiter
from app.models.farmer_qa import FarmerQALog
from app.schemas.farmer_qa import (
    FarmerQARequest,
    FarmerQAResponse,
    FarmerVoiceQAResponse
)
from app.schemas.crop_recommendation import ErrorResponse
from app.services.farmer_qa_service import (
    farmer_qa_service,
    GroqServiceUnavailableException,
    GroqTranscriptionUnavailableException
)

logger = logging.getLogger("fasalsetu_api")
router = APIRouter()

ALLOWED_AUDIO_EXTENSIONS = {".m4a", ".mp3", ".wav", ".webm"}
MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB Groq Whisper limit


@router.post(
    "/farmer-qa",
    response_model=FarmerQAResponse,
    responses={
        200: {"model": FarmerQAResponse, "description": "Agricultural advice generated successfully"},
        422: {"description": "Input validation error (missing or too short question)"},
        429: {"description": "Rate limit exceeded (max 10 requests per minute)"},
        503: {"model": ErrorResponse, "description": "Groq assistant service temporarily unavailable"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Ask an agricultural question in Hindi, English, or regional Indian languages"
)
def ask_question(
    payload: FarmerQARequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Receives a farmer's question, sends it to the Groq LLM with a 15-second timeout,
    and returns a concise, practical answer scoped to agriculture in the farmer's language.
    Supports session-scoped multi-turn follow-ups via session_id.
    """
    # 1. Rate Limiting Protection (10 requests/minute per client IP)
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "127.0.0.1")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    allowed, _ = qa_rate_limiter.is_allowed(client_ip)
    if not allowed:
        logger.warning(f"Rate limit exceeded for client IP: {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"error": "Rate limit exceeded. Maximum 10 requests per minute allowed. Please wait before asking another question."}
        )

    # 2. Session ID Management & Prior Conversation Retrieval
    session_id = payload.session_id.strip() if payload.session_id and payload.session_id.strip() else str(uuid.uuid4())

    history = []
    prior_logs = db.query(FarmerQALog).filter(
        FarmerQALog.session_id == session_id
    ).order_by(FarmerQALog.id.desc()).limit(MAX_CONVERSATION_HISTORY).all()
    if prior_logs:
        prior_logs.reverse()  # Chronological order: oldest to newest
        history = [
            {"question": log.question_text, "answer": log.response_text}
            for log in prior_logs
        ]

    # 3. Query Groq via FarmerQAService (with injected conversational history if present)
    try:
        result = farmer_qa_service.ask(
            question=payload.question,
            language_hint=payload.language,
            history=history
        )

        # 4. Log request to database
        db_log = FarmerQALog(
            session_id=session_id,
            question_text=payload.question,
            language_used=result["language_used"],
            response_text=result["answer"],
            was_flagged_offtopic=not result["is_farming_related"],
            groq_model_used=result["model_used"],
            was_voice_input=False
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)

        logger.info(
            f"Farmer Q&A logged with ID {db_log.id}: session='{session_id}', "
            f"lang='{result['language_used']}', farming_related={result['is_farming_related']}"
        )

        return FarmerQAResponse(
            answer=result["answer"],
            language_used=result["language_used"],
            disclaimer=result["disclaimer"],
            is_farming_related=result["is_farming_related"],
            session_id=session_id
        )

    except GroqServiceUnavailableException as exc:
        logger.error(f"Groq service unavailable: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Assistant service unavailable, please try again shortly"}
        )
    except Exception as exc:
        logger.error(f"Internal error processing farmer question: {exc}", exc_info=True)
        try:
            db.rollback()
        except Exception:
            pass
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Failed to process question. Please try again."}
        )


@router.post(
    "/farmer-qa/voice",
    response_model=FarmerVoiceQAResponse,
    responses={
        200: {"model": FarmerVoiceQAResponse, "description": "Agricultural advice generated from voice query"},
        422: {"description": "Validation error (missing audio file, file size > 25MB, or unsupported format)"},
        429: {"description": "Rate limit exceeded (max 10 requests per minute)"},
        503: {"model": ErrorResponse, "description": "Transcription or LLM assistant service temporarily unavailable"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Ask an agricultural question via voice recording in Hindi, English, or regional languages"
)
def ask_question_voice(
    request: Request,
    audio: Optional[UploadFile] = File(None, description="Voice recording audio file (m4a, mp3, wav, webm; max 25MB)"),
    language: Optional[str] = Form(None, description="Optional language hint (e.g. 'hindi', 'english')"),
    session_id: Optional[str] = Form(None, description="Optional session UUID for conversational follow-ups"),
    db: Session = Depends(get_db)
):
    """
    Receives an audio voice recording from a farmer, transcribes it via Groq Whisper
    (15s timeout), queries the Groq LLM for agricultural guidance, logs the query,
    and returns both the transcribed question and the structured guidance.
    Supports session-scoped multi-turn follow-ups via session_id.
    """
    # 1. Rate Limiting Protection (10 requests/minute per client IP)
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "127.0.0.1")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    allowed, _ = qa_rate_limiter.is_allowed(client_ip)
    if not allowed:
        logger.warning(f"Rate limit exceeded for voice client IP: {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"error": "Rate limit exceeded. Maximum 10 requests per minute allowed. Please wait before asking another question."}
        )

    # 2. Audio File Presence & Format Validation (422)
    if not audio or not audio.filename:
        logger.warning("Voice query rejected: No audio file provided")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": "Audio file is required. Please provide a recording in m4a, mp3, wav, or webm format."}
        )

    ext = os.path.splitext(audio.filename)[1].lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        logger.warning(f"Voice query rejected: Unsupported audio extension '{ext}'")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": f"Unsupported audio format '{ext}'. Allowed formats: m4a, mp3, wav, webm"}
        )

    # 3. Read Audio Bytes & Validate Size Limit (25 MB)
    try:
        audio_bytes = audio.file.read()
    except Exception as exc:
        logger.error(f"Failed to read audio file: {exc}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": "Could not read uploaded audio file"}
        )

    if len(audio_bytes) == 0:
        logger.warning("Voice query rejected: Uploaded audio file is empty (0 bytes)")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": "Audio file is empty. Please provide a valid recording."}
        )

    if len(audio_bytes) > MAX_AUDIO_SIZE_BYTES:
        logger.warning(f"Voice query rejected: File size ({len(audio_bytes)} bytes) exceeds 25MB limit")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": f"Audio file exceeds maximum size limit of 25MB (uploaded: {len(audio_bytes)} bytes)"}
        )

    # 4. Transcribe Audio via Groq Whisper (15s timeout)
    try:
        transcribed_text = farmer_qa_service.transcribe_audio(
            file_bytes=audio_bytes,
            filename=audio.filename,
            language_hint=language
        )
    except GroqTranscriptionUnavailableException as exc:
        logger.error(f"Voice transcription unavailable: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Voice transcription unavailable, please try again shortly"}
        )
    except Exception as exc:
        logger.error(f"Unexpected error during voice transcription: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Voice transcription unavailable, please try again shortly"}
        )

    # 5. Session ID Management & Prior Conversation Retrieval
    clean_session_id = session_id.strip() if session_id and session_id.strip() else str(uuid.uuid4())

    history = []
    prior_logs = db.query(FarmerQALog).filter(
        FarmerQALog.session_id == clean_session_id
    ).order_by(FarmerQALog.id.desc()).limit(MAX_CONVERSATION_HISTORY).all()
    if prior_logs:
        prior_logs.reverse()  # Chronological order: oldest to newest
        history = [
            {"question": log.question_text, "answer": log.response_text}
            for log in prior_logs
        ]

    # 6. Query Downstream Agricultural LLM via FarmerQAService.ask()
    try:
        result = farmer_qa_service.ask(
            question=transcribed_text,
            language_hint=language,
            history=history
        )

        # 7. Database Logging
        db_log = FarmerQALog(
            session_id=clean_session_id,
            question_text=transcribed_text,
            language_used=result["language_used"],
            response_text=result["answer"],
            was_flagged_offtopic=not result["is_farming_related"],
            groq_model_used=result["model_used"],
            was_voice_input=True
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)

        logger.info(
            f"Voice Farmer Q&A logged with ID {db_log.id}: session='{clean_session_id}', "
            f"transcribed='{transcribed_text[:50]}...', lang='{result['language_used']}'"
        )

        return FarmerVoiceQAResponse(
            transcribed_question=transcribed_text,
            answer=result["answer"],
            language_used=result["language_used"],
            disclaimer=result["disclaimer"],
            is_farming_related=result["is_farming_related"],
            session_id=clean_session_id
        )

    except GroqServiceUnavailableException as exc:
        logger.error(f"Downstream Groq Q&A service unavailable for voice query: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Assistant service unavailable, please try again shortly"}
        )
    except Exception as exc:
        logger.error(f"Internal error processing voice farmer question: {exc}", exc_info=True)
        try:
            db.rollback()
        except Exception:
            pass
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Failed to process voice question. Please try again."}
        )


