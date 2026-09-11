"""
FastAPI Router for Feature 5: Image-based Crop Diagnosis
========================================================
Exposes POST /api/crop-diagnosis to analyze uploaded crop/leaf images,
identify diseases/pests, and return actionable treatment advice.
"""

import os
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.constants import ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE_BYTES
from app.core.rate_limiter import qa_rate_limiter
from app.models.crop_diagnosis import CropDiagnosisLog
from app.schemas.crop_diagnosis import CropDiagnosisResponse
from app.schemas.crop_recommendation import ErrorResponse
from app.services.crop_diagnosis_service import (
    crop_diagnosis_service,
    GroqDiagnosisUnavailableException
)

logger = logging.getLogger("fasalsetu_crop_diagnosis_api")

router = APIRouter(tags=["Crop Diagnosis"])


@router.post(
    "/crop-diagnosis",
    response_model=CropDiagnosisResponse,
    responses={
        200: {"model": CropDiagnosisResponse, "description": "Structured crop disease diagnosis and treatment advice"},
        422: {"description": "Validation error (missing image, file size > 10MB, or unsupported format)"},
        429: {"description": "Rate limit exceeded (max 10 requests per minute)"},
        503: {"model": ErrorResponse, "description": "Vision model service unavailable or timed out"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Diagnose crop diseases or pests from an uploaded leaf photo"
)
def diagnose_crop_image(
    request: Request,
    image: Optional[UploadFile] = File(None, description="Crop leaf photo file (jpg, jpeg, png, webp; max 10MB)"),
    question: Optional[str] = Form(None, description="Optional text question or observations from the farmer"),
    language: Optional[str] = Form(None, description="Optional language hint (e.g. 'hindi', 'english')"),
    session_id: Optional[str] = Form(None, description="Optional session UUID for conversational follow-ups"),
    db: Session = Depends(get_db)
):
    """
    Receives an image of a diseased or damaged crop/leaf, runs diagnosis via Groq's
    vision model (15s timeout), logs the interaction in crop_diagnosis_logs,
    and returns structured diagnosis, confidence note, treatment suggestions, and disclaimers.
    """
    # 1. Rate Limiting (10 requests/minute per client IP, shared with Q&A)
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "127.0.0.1")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    allowed, _ = qa_rate_limiter.is_allowed(client_ip)
    if not allowed:
        logger.warning(f"Rate limit exceeded for crop diagnosis client IP: {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"error": "Rate limit exceeded. Maximum 10 requests per minute allowed. Please wait before asking another question."}
        )

    # 2. Image File Presence & Format Validation (422)
    if not image or not image.filename:
        logger.warning("Crop diagnosis rejected: No image file provided")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": "Image file is required. Please provide a photo of the affected plant or leaf (jpg, jpeg, png, webp)."}
        )

    ext = os.path.splitext(image.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        logger.warning(f"Crop diagnosis rejected: Unsupported image extension '{ext}'")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": f"Unsupported image format '{ext}'. Allowed formats: jpg, jpeg, png, webp"}
        )

    # 3. Read Image Bytes & Validate File Size Limit (10MB)
    try:
        image_bytes = image.file.read()
    except Exception as exc:
        logger.error(f"Failed to read image file: {exc}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": "Could not read uploaded image file"}
        )

    if len(image_bytes) == 0:
        logger.warning("Crop diagnosis rejected: Uploaded image file is empty (0 bytes)")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": "Image file is empty. Please provide a valid photo."}
        )

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        logger.warning(f"Crop diagnosis rejected: File size ({len(image_bytes)} bytes) exceeds 10MB limit")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": f"Image file exceeds maximum size limit of 10MB (uploaded: {len(image_bytes)} bytes)"}
        )

    # 4. Session ID Management
    clean_session_id = session_id.strip() if session_id and session_id.strip() else str(uuid.uuid4())

    # 5. Call Vision Model via CropDiagnosisService (15s timeout)
    try:
        result = crop_diagnosis_service.diagnose(
            image_bytes=image_bytes,
            image_filename=image.filename,
            question=question,
            language_hint=language
        )

        # 6. Database Logging
        db_log = CropDiagnosisLog(
            session_id=clean_session_id,
            question_text=question,
            image_filename=image.filename,
            diagnosis=result["diagnosis"],
            confidence_note=result["confidence_note"],
            suggested_treatment=result["suggested_treatment"],
            language_used=result["language_used"],
            disclaimer=result["disclaimer"],
            groq_model_used=result["model_used"]
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)

        logger.info(
            f"Crop diagnosis logged with ID {db_log.id}: session='{clean_session_id}', "
            f"diagnosis='{result['diagnosis'][:40]}...', lang='{result['language_used']}'"
        )

        return CropDiagnosisResponse(
            log_id=db_log.id,
            diagnosis=result["diagnosis"],
            confidence_note=result["confidence_note"],
            suggested_treatment=result["suggested_treatment"],
            language_used=result["language_used"],
            disclaimer=result["disclaimer"],
            session_id=clean_session_id
        )

    except GroqDiagnosisUnavailableException as exc:
        logger.error(f"Crop diagnosis vision service unavailable: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Image diagnosis unavailable, please try again shortly"}
        )
    except Exception as exc:
        logger.error(f"Internal error processing crop diagnosis: {exc}", exc_info=True)
        try:
            db.rollback()
        except Exception:
            pass
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Failed to process image diagnosis. Please try again."}
        )
