"""
FastAPI Router for Feature 12: Water Irrigation Advisory
========================================================
Endpoint providing rule-estimated soil moisture and irrigation urgency tiers
calculated from live/forecast Open-Meteo weather data.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import JSONResponse

from app.core.constants import VALID_CROPS, VALID_CROPS_SET
from app.schemas.irrigation import IrrigationAdvisoryResponse
from app.schemas.crop_recommendation import ErrorResponse
from app.services.irrigation_service import (
    irrigation_service,
    WeatherServiceUnavailableException,
)

router = APIRouter(tags=["Water Irrigation Advisory"])


@router.get(
    "/irrigation-advisory",
    response_model=IrrigationAdvisoryResponse,
    responses={
        200: {"model": IrrigationAdvisoryResponse, "description": "Soil moisture estimate and irrigation advice generated successfully"},
        422: {"description": "Validation error (missing/invalid coordinates or unrecognized crop)"},
        503: {"model": ErrorResponse, "description": "Weather data service temporarily unavailable"}
    },
    summary="Get rule-based water irrigation advisory from live Open-Meteo weather data"
)
def get_irrigation_advisory(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude coordinate of the farm field (-90.0 to 90.0)"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude coordinate of the farm field (-180.0 to 180.0)"),
    crop: str = Query(..., description="Crop name to evaluate (must be one of 22 valid crops)"),
    soil_type: Optional[str] = Query(None, description="Optional soil type ('sandy', 'clay', 'black', 'loamy', 'alluvial', 'silt', 'red'). Defaults to 'loamy'.")
):
    """
    Evaluates current soil moisture level and irrigation urgency for a specific farm field location.
    Combines real-time Open-Meteo weather observations (temperature, relative humidity, recent rainfall)
    and short-term precipitation forecasts with crop water demand and soil drainage characteristics.

    Explicitly labeled as a rule-based estimate, not a direct sensor reading.
    """
    # 1. Validate crop against canonical 22 crop list (case-insensitive)
    normalized_crop = crop.strip().lower()
    if normalized_crop not in VALID_CROPS_SET:
        valid_list_str = ", ".join(sorted(VALID_CROPS))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Crop '{crop}' is not recognized. Must be one of: {valid_list_str}"
        )

    # 2. Fetch weather observations and short-term forecast from Open-Meteo
    try:
        weather_data = irrigation_service.fetch_weather(latitude=latitude, longitude=longitude)
    except WeatherServiceUnavailableException:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "error": "Weather data unavailable, please try again shortly",
                "detail": "Weather data unavailable, please try again shortly"
            }
        )

    # 3. Calculate rule-based advisory
    advisory = irrigation_service.calculate_advisory(
        weather_data=weather_data,
        crop=normalized_crop,
        soil_type=soil_type
    )

    return advisory
