"""
API Router for Feature 14: Farm Profile Data
=============================================
Provides endpoints for farmer farm profile management:
- POST /api/farm-profile: Initial onboarding profile creation (1-to-1, rejects duplicates with 409)
- GET /api/farm-profile: Fetch authenticated farmer's profile (404 if not found)
- PUT /api/farm-profile: Edit/partial update authenticated farmer's profile (404 if not found)
- GET /api/valid-crops: Helper endpoint exposing the 22 supported canonical crops to avoid frontend drift
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.constants import VALID_CROPS
from app.models.user import User
from app.models.farm_profile import FarmProfile
from app.schemas.farm_profile import (
    FarmProfileCreateRequest,
    FarmProfileUpdateRequest,
    FarmProfileResponse,
    ValidCropsResponse,
)
from app.api.deps import require_role

router = APIRouter()


@router.post(
    "/farm-profile",
    response_model=FarmProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create farmer onboarding profile",
    description="Creates a new farm profile for the authenticated farmer. Enforces one profile per farmer (409 Conflict if profile already exists).",
)
def create_farm_profile(
    payload: FarmProfileCreateRequest,
    current_user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
):
    # Enforce one profile per farmer
    existing = db.query(FarmProfile).filter(FarmProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Farm profile already exists for this farmer. Use PUT /api/farm-profile to update.",
        )

    profile = FarmProfile(
        user_id=current_user.id,
        crop=payload.crop,
        land_size=payload.land_size,
        land_unit=payload.land_unit,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        full_name=payload.full_name,
        farming_type=payload.farming_type,
        soil_type=payload.soil_type,
        preferred_language=payload.preferred_language or "en",
        units_preference=payload.units_preference or "quintals-acres",
        sms_notifications_enabled=payload.sms_notifications_enabled
        if payload.sms_notifications_enabled is not None
        else True,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get(
    "/farm-profile",
    response_model=FarmProfileResponse,
    summary="Get authenticated farmer's profile",
    description="Retrieves the farm profile associated with the authenticated farmer. Returns 404 if no profile has been created yet.",
)
def get_farm_profile(
    current_user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
):
    profile = db.query(FarmProfile).filter(FarmProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm profile not found. Please complete onboarding via POST /api/farm-profile.",
        )
    return profile


@router.put(
    "/farm-profile",
    response_model=FarmProfileResponse,
    summary="Update authenticated farmer's profile",
    description="Updates one or more fields in the authenticated farmer's farm profile. Returns 404 if no profile exists.",
)
def update_farm_profile(
    payload: FarmProfileUpdateRequest,
    current_user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
):
    profile = db.query(FarmProfile).filter(FarmProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm profile not found. Please complete onboarding via POST /api/farm-profile before updating.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        setattr(profile, field_name, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get(
    "/valid-crops",
    response_model=ValidCropsResponse,
    summary="Get supported canonical crops",
    description="Returns the list of 22 canonical crops supported by the FasalSetu backend to prevent frontend/backend drift.",
)
def get_valid_crops():
    return ValidCropsResponse(valid_crops=sorted(list(VALID_CROPS)))
