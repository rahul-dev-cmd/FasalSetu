"""
Feedback API Router
===================
Handles submission and retrieval of user feedback (thumbs up/down + optional comment)
for logged AI responses from Farmer Q&A and Crop Diagnosis.
"""

from datetime import datetime, timezone
import logging
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.farmer_qa import FarmerQALog
from app.models.crop_diagnosis import CropDiagnosisLog
from app.schemas.feedback import FeedbackSubmitRequest, FeedbackResponse

logger = logging.getLogger("fasalsetu.feedback")

router = APIRouter(prefix="/feedback")


@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit feedback for an AI response",
    description=(
        "Records a thumbs up/down rating and optional comment against an existing "
        "Farmer Q&A log or Crop Diagnosis log. Overwrites existing feedback if submitted again."
    )
)
def submit_feedback(
    payload: FeedbackSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Submits or updates feedback against an existing Q&A or diagnosis log entry.
    - log_type: 'qa' or 'diagnosis'
    - log_id: ID of the corresponding log row
    - rating: 'up' or 'down'
    - comment: optional text (up to 500 chars)
    """
    if payload.log_type == "qa":
        log_entry = db.query(FarmerQALog).filter(FarmerQALog.id == payload.log_id).first()
    elif payload.log_type == "diagnosis":
        log_entry = db.query(CropDiagnosisLog).filter(CropDiagnosisLog.id == payload.log_id).first()
    else:
        # Pydantic validates literal, but defensive check
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid log_type '{payload.log_type}'. Must be 'qa' or 'diagnosis'."
        )

    if not log_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log entry {payload.log_id} not found in {payload.log_type} records."
        )

    # Overwrite / update feedback
    now = datetime.now(timezone.utc)
    log_entry.feedback_rating = payload.rating
    log_entry.feedback_comment = payload.comment
    log_entry.feedback_submitted_at = now

    db.commit()
    db.refresh(log_entry)

    logger.info(
        f"Feedback recorded: type='{payload.log_type}', id={payload.log_id}, "
        f"rating='{payload.rating}', comment_len={len(payload.comment) if payload.comment else 0}"
    )

    return FeedbackResponse(
        log_type=payload.log_type,
        log_id=log_entry.id,
        rating=log_entry.feedback_rating,
        comment=log_entry.feedback_comment,
        submitted_at=log_entry.feedback_submitted_at
    )


@router.get(
    "/{log_type}/{log_id}",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Get feedback for an AI response",
    description="Retrieves the feedback recorded for a specific Q&A or diagnosis log entry."
)
def get_feedback(
    log_type: Literal["qa", "diagnosis"],
    log_id: int,
    db: Session = Depends(get_db)
):
    """Retrieves recorded feedback for a log entry."""
    if log_type == "qa":
        log_entry = db.query(FarmerQALog).filter(FarmerQALog.id == log_id).first()
    elif log_type == "diagnosis":
        log_entry = db.query(CropDiagnosisLog).filter(CropDiagnosisLog.id == log_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid log_type '{log_type}'."
        )

    if not log_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log entry {log_id} not found in {log_type} records."
        )

    if not log_entry.feedback_rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No feedback has been submitted yet for {log_type} log {log_id}."
        )

    return FeedbackResponse(
        log_type=log_type,
        log_id=log_entry.id,
        rating=log_entry.feedback_rating,
        comment=log_entry.feedback_comment,
        submitted_at=log_entry.feedback_submitted_at
    )
