"""
Farmer Q&A Assistant API Route
==============================
Handles POST /api/farmer-qa, providing regional language agricultural advice via Groq LLM.
Includes request validation, per-IP rate limiting, database logging, and graceful 503 error handling.
"""

import logging
from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limiter import qa_rate_limiter
from app.models.farmer_qa import FarmerQALog
from app.schemas.farmer_qa import FarmerQARequest, FarmerQAResponse
from app.schemas.crop_recommendation import ErrorResponse
from app.services.farmer_qa_service import farmer_qa_service, GroqServiceUnavailableException

logger = logging.getLogger("fasalsetu_api")
router = APIRouter()


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

    # 2. Query Groq via FarmerQAService
    try:
        result = farmer_qa_service.ask(
            question=payload.question,
            language_hint=payload.language
        )

        # 3. Log request to database
        db_log = FarmerQALog(
            question_text=payload.question,
            language_used=result["language_used"],
            response_text=result["answer"],
            was_flagged_offtopic=not result["is_farming_related"],
            groq_model_used=result["model_used"]
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)

        logger.info(
            f"Farmer Q&A logged with ID {db_log.id}: "
            f"lang='{result['language_used']}', farming_related={result['is_farming_related']}"
        )

        return FarmerQAResponse(
            answer=result["answer"],
            language_used=result["language_used"],
            disclaimer=result["disclaimer"],
            is_farming_related=result["is_farming_related"]
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
