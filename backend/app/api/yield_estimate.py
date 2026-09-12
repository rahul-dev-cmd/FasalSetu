"""
FastAPI Router for Feature 13: Yield & Harvest Estimate
=======================================================
Provides GET /api/yield-estimate for benchmark-derived expected crop yield ranges,
growth progress, harvest windows, harvest ETA, and market-grounded value/profit projections.
"""

from datetime import date
from typing import Optional
import logging
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.constants import VALID_CROPS, VALID_CROPS_SET
from app.schemas.yield_estimate import YieldEstimateResponse
from app.schemas.crop_recommendation import ErrorResponse
from app.services.yield_service import yield_service

logger = logging.getLogger("fasalsetu_api")
router = APIRouter(tags=["Yield & Harvest Estimate"])


@router.get(
    "/yield-estimate",
    response_model=YieldEstimateResponse,
    responses={
        200: {"model": YieldEstimateResponse, "description": "Yield and harvest estimate computed successfully"},
        422: {"description": "Validation error (unrecognized crop, land_size_acres <= 0, or sowing_date in the future)"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Compute benchmark-derived crop yield, harvest window, and profit projection"
)
def get_yield_estimate(
    crop: str = Query(..., description="Crop name to evaluate (must be one of 22 valid crops)"),
    land_size_acres: float = Query(..., description="Land area in acres (must be greater than 0)"),
    sowing_date: date = Query(..., description="Crop sowing/planting date (YYYY-MM-DD, must not be in the future)"),
    field_name: Optional[str] = Query("My Field", description="Optional farmer-provided field label (defaults to 'My Field')"),
    state: Optional[str] = Query(None, description="Optional Indian state to filter market prices (case-insensitive)"),
    db: Session = Depends(get_db)
):
    """
    Computes a deterministic, benchmark-derived yield and harvest timeline estimate for a field.

    - **Validation**: Rejects unsupported crops (e.g. wheat, soybean) with HTTP 422.
    - **Yield & Calendar**: Evaluates expected min/max quintals and harvest calendar dates based on published ICAR benchmarks.
    - **Market Valuation**: Integrates modal mandi prices to project crop value and per-acre net profit (using category-specific cost ratios).
    - **Estimate Disclaimer**: Operates statelessly without hardware sensors or LLM inference.
    """
    # 1. Validate crop against canonical 22 crop list (case-insensitive)
    normalized_crop = crop.strip().lower()
    if normalized_crop not in VALID_CROPS_SET:
        valid_list_str = ", ".join(sorted(VALID_CROPS))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Crop '{crop}' is not recognized. Must be one of: {valid_list_str}"
        )

    # 2. Validate land size (> 0)
    if land_size_acres <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="land_size_acres must be greater than 0."
        )

    # 3. Validate sowing date (not in future)
    today = date.today()
    if sowing_date > today:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="sowing_date cannot be in the future."
        )

    # 4. Compute estimate
    try:
        estimate = yield_service.calculate_estimate(
            crop=normalized_crop,
            land_size_acres=land_size_acres,
            sowing_date=sowing_date,
            field_name=field_name,
            state=state,
            db=db,
            reference_date=today
        )
        return estimate
    except Exception as exc:
        logger.error(f"Internal error computing yield estimate: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate yield estimate. Please try again."
        )
