"""
Pydantic Schemas for Feature 16a: Buyer Company Profile
=======================================================
Defines validation schemas for buyer company profile creation, editing,
and full / public response serialization.
"""

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.core.constants import (
    VALID_BUYER_TAGS,
    VALID_BUYER_TAGS_SET,
    compute_avatar_initial,
    compute_avatar_color,
)


class BuyerProfileCreateRequest(BaseModel):
    """Payload for buyer company profile registration."""
    company_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Buyer enterprise or trading company name",
        examples=["Shree Balaji Agro Foods"]
    )
    tags: List[str] = Field(
        ...,
        min_length=1,
        description="Operational tags from canonical vocabulary",
        examples=[["Wholesaler", "Immediate Payment"]]
    )
    location: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Business location (city, mandi, or district)",
        examples=["APMC Vashi, Navi Mumbai"]
    )
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Optional GPS latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Optional GPS longitude coordinate")

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("At least one tag is required")
        for tag in v:
            if tag not in VALID_BUYER_TAGS_SET:
                valid_list = ", ".join(VALID_BUYER_TAGS)
                raise ValueError(f"Tag '{tag}' is not recognized. Must be one of: {valid_list}")
        return v


class BuyerProfileUpdateRequest(BaseModel):
    """
    Payload for buyer company profile updates.
    Only company_name, tags, location, latitude, and longitude are editable.
    Any attempt to supply verified, rating, or review_count is silently ignored.
    """
    company_name: Optional[str] = Field(None, min_length=2, max_length=255, description="Updated company name")
    tags: Optional[List[str]] = Field(None, min_length=1, description="Updated tags list")
    location: Optional[str] = Field(None, min_length=2, max_length=255, description="Updated location label")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Updated GPS latitude")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Updated GPS longitude")

    # Fields that may be passed in update payloads but must be silently ignored by the handler
    verified: Optional[Any] = None
    rating: Optional[Any] = None
    review_count: Optional[Any] = None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return None
        if not v:
            raise ValueError("At least one tag is required when updating tags")
        for tag in v:
            if tag not in VALID_BUYER_TAGS_SET:
                valid_list = ", ".join(VALID_BUYER_TAGS)
                raise ValueError(f"Tag '{tag}' is not recognized. Must be one of: {valid_list}")
        return v


class BuyerProfileResponse(BaseModel):
    """Complete serialized buyer company profile record (private/owner view)."""
    id: int = Field(..., description="Profile record identifier")
    user_id: int = Field(..., description="Foreign key identifying the owning buyer")
    company_name: str = Field(..., description="Company name")
    tags: List[str] = Field(..., description="Operational tags")
    location: str = Field(..., description="Business location description")
    latitude: Optional[float] = Field(None, description="GPS latitude coordinate")
    longitude: Optional[float] = Field(None, description="GPS longitude coordinate")
    verified: bool = Field(..., description="Verification status flag")
    rating: float = Field(..., description="Seeded aggregate rating (one decimal)")
    review_count: int = Field(..., description="Seeded total review count")
    avatar_initial: str = Field(..., description="Derived avatar abbreviation (e.g. 'SB')")
    avatar_color: str = Field(..., description="Derived deterministic avatar hex color")
    created_at: datetime = Field(..., description="Profile creation timestamp")
    updated_at: datetime = Field(..., description="Most recent profile update timestamp")

    model_config = ConfigDict(from_attributes=True)


class BuyerProfilePublicResponse(BaseModel):
    """
    Public serialized buyer profile (for farmers/counterparts during negotiation).
    Omits private precise GPS coordinates (latitude/longitude) for privacy.
    """
    buyer_user_id: int = Field(..., description="User ID of the buyer")
    company_name: str = Field(..., description="Company name")
    avatar_initial: str = Field(..., description="Derived avatar abbreviation")
    avatar_color: str = Field(..., description="Derived deterministic avatar hex color")
    verified: bool = Field(..., description="Verification status flag")
    tags: List[str] = Field(..., description="Operational tags")
    rating: float = Field(..., description="Seeded aggregate rating")
    review_count: int = Field(..., description="Seeded total review count")
    location: str = Field(..., description="General business location")

    model_config = ConfigDict(from_attributes=True)
