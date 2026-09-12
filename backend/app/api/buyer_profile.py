"""
API Router for Feature 16a: Buyer Company Profile
==================================================
Provides endpoints for buyer company profile management:
- POST /api/buyer-profile: Create own profile (1-to-1, rejects duplicates with 409)
- GET /api/buyer-profile: Fetch authenticated buyer's full profile (404 if not found)
- PUT /api/buyer-profile: Edit authenticated buyer's profile (explicitly whitelisted fields only)
- GET /api/buyer-profile/{buyer_user_id}: Public-facing buyer profile for farmers/counterparts
"""

import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.constants import compute_avatar_initial, compute_avatar_color
from app.models.user import User
from app.models.buyer_profile import BuyerProfile
from app.schemas.buyer_profile import (
    BuyerProfileCreateRequest,
    BuyerProfileUpdateRequest,
    BuyerProfileResponse,
    BuyerProfilePublicResponse,
)
from app.api.deps import get_current_user, require_role

router = APIRouter()

# Whitelisted editable fields on PUT /api/buyer-profile
EDITABLE_PROFILE_FIELDS = ("company_name", "tags", "location", "latitude", "longitude")


def _to_full_response(profile: BuyerProfile) -> BuyerProfileResponse:
    return BuyerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        company_name=profile.company_name,
        tags=profile.tags,
        location=profile.location,
        latitude=profile.latitude,
        longitude=profile.longitude,
        verified=profile.verified,
        rating=profile.rating,
        review_count=profile.review_count,
        avatar_initial=compute_avatar_initial(profile.company_name),
        avatar_color=compute_avatar_color(profile.company_name),
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.post(
    "/buyer-profile",
    response_model=BuyerProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create buyer company profile",
    description="Registers a company profile for the authenticated buyer. Enforces 1-to-1 relationship (409 on duplicate).",
)
def create_buyer_profile(
    payload: BuyerProfileCreateRequest,
    current_user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
):
    # Enforce one profile per buyer
    existing = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Buyer profile already exists for this user. Use PUT /api/buyer-profile to update.",
        )

    # Demo simplifications: auto-verify and seed starter reputation metrics once
    seeded_rating = round(random.uniform(3.5, 4.9), 1)
    seeded_review_count = random.randint(30, 150)

    profile = BuyerProfile(
        user_id=current_user.id,
        company_name=payload.company_name,
        tags=payload.tags,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        verified=True,
        rating=seeded_rating,
        review_count=seeded_review_count,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return _to_full_response(profile)


@router.get(
    "/buyer-profile",
    response_model=BuyerProfileResponse,
    summary="Get authenticated buyer's company profile",
    description="Retrieves the full company profile belonging to the authenticated buyer.",
)
def get_own_buyer_profile(
    current_user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
):
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buyer profile not found. Please create one via POST /api/buyer-profile.",
        )
    return _to_full_response(profile)


@router.put(
    "/buyer-profile",
    response_model=BuyerProfileResponse,
    summary="Update authenticated buyer's company profile",
    description=(
        "Updates editable fields (company_name, tags, location, latitude, longitude). "
        "Any attempts to alter verified, rating, or review_count are silently ignored."
    ),
)
def update_own_buyer_profile(
    payload: BuyerProfileUpdateRequest,
    current_user: User = Depends(require_role("buyer")),
    db: Session = Depends(get_db),
):
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buyer profile not found. Please create one via POST /api/buyer-profile before updating.",
        )

    # Explicitly whitelist editable fields only — ignore verified, rating, review_count
    raw_data = payload.model_dump(exclude_unset=True)
    for field_name in EDITABLE_PROFILE_FIELDS:
        if field_name in raw_data and raw_data[field_name] is not None:
            setattr(profile, field_name, raw_data[field_name])

    db.commit()
    db.refresh(profile)
    return _to_full_response(profile)


@router.get(
    "/buyer-profile/{buyer_user_id}",
    response_model=BuyerProfilePublicResponse,
    summary="Get public buyer company profile",
    description="Public-facing buyer identity view for farmers and counterparts during negotiation. Omits private GPS coordinates.",
)
def get_public_buyer_profile(
    buyer_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == buyer_user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Buyer profile for user {buyer_user_id} not found.",
        )

    return BuyerProfilePublicResponse(
        buyer_user_id=profile.user_id,
        company_name=profile.company_name,
        avatar_initial=compute_avatar_initial(profile.company_name),
        avatar_color=compute_avatar_color(profile.company_name),
        verified=profile.verified,
        tags=profile.tags,
        rating=profile.rating,
        review_count=profile.review_count,
        location=profile.location,
    )
