"""
Crop Recommendation API Route
=============================
Handles POST /api/crop-recommendation, running ML inference and logging recommendations.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.crop_recommendation import CropRecommendationLog
from app.schemas.crop_recommendation import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    ErrorResponse
)
from app.ml.predictor import predictor

logger = logging.getLogger("fasalsetu_api")
router = APIRouter()


@router.post(
    "/crop-recommendation",
    response_model=CropRecommendationResponse,
    responses={
        200: {"model": CropRecommendationResponse, "description": "Successful crop recommendation"},
        422: {"description": "Input validation error (e.g. invalid pH or humidity range)"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Recommend crops based on soil and weather metrics"
)
def recommend_crop(
    payload: CropRecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Receives soil nutrients (N, P, K), temperature, humidity, pH, and rainfall.
    Runs inference via the pre-trained Random Forest model and logs the recommendation.
    """
    try:
        # Run ML model inference
        prediction = predictor.predict(
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            temperature=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall
        )

        # Log recommendation to database
        db_log = CropRecommendationLog(
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            temperature=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall,
            recommended_crop=prediction["recommended_crop"],
            confidence=prediction["confidence"],
            alternatives=prediction["alternatives"]
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)

        logger.info(
            f"Crop recommendation logged with ID {db_log.id}: "
            f"{prediction['recommended_crop']} ({prediction['confidence']})"
        )

        return CropRecommendationResponse(**prediction)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Internal error during crop recommendation: {exc}", exc_info=True)
        # Roll back DB in case of error
        try:
            db.rollback()
        except Exception:
            pass
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Failed to generate crop recommendation. Please try again."}
        )
