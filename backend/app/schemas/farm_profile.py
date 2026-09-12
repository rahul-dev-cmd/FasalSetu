"""
Pydantic Schemas for Feature 14: Farm Profile Data
==================================================
Defines request and response schemas matching the frontend FarmDetailsScreen
(onboarding creation) and ProfileScreen (profile viewing & editing) contracts.
"""

from datetime import datetime
from typing import Optional, Literal, List
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.core.constants import VALID_CROPS, VALID_CROPS_SET

ALLOWED_LAND_UNITS = ("acres", "hectares", "bigha")
ALLOWED_FARMING_TYPES = ("Organic", "Conventional")
ALLOWED_LANGUAGES = ("hi", "en", "te", "mr", "gu", "ta")
ALLOWED_UNITS_PREFERENCE = ("quintals-acres", "kg-hectares")


class FarmProfileCreateRequest(BaseModel):
    """Payload for farmer onboarding via FarmDetailsScreen."""
    crop: str = Field(..., min_length=2, description="Primary crop cultivated (must be in canonical 22 crops)")
    land_size: float = Field(..., gt=0, description="Total cultivated land area (must be greater than 0)")
    land_unit: Literal["acres", "hectares", "bigha"] = Field(..., description="Land unit measurement")
    location: str = Field(..., min_length=2, max_length=255, description="Free-text or geocoded farm location label")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Optional GPS latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Optional GPS longitude coordinate")

    full_name: Optional[str] = Field(None, max_length=150, description="Farmer's full name")
    farming_type: Optional[Literal["Organic", "Conventional"]] = Field(None, description="Type of farming practiced")
    soil_type: Optional[str] = Field(None, max_length=100, description="Soil classification")
    preferred_language: Optional[Literal["hi", "en", "te", "mr", "gu", "ta"]] = Field("en", description="Preferred app language code")
    units_preference: Optional[Literal["quintals-acres", "kg-hectares"]] = Field("quintals-acres", description="Preferred display units")
    sms_notifications_enabled: Optional[bool] = Field(True, description="SMS notifications preference toggle (stored only)")

    @field_validator("crop")
    @classmethod
    def validate_crop(cls, v: str) -> str:
        norm = v.strip().lower()
        if norm not in VALID_CROPS_SET:
            valid_list = ", ".join(sorted(VALID_CROPS))
            raise ValueError(f"Crop '{v}' is not recognized. Must be one of: {valid_list}")
        return norm


class FarmProfileUpdateRequest(BaseModel):
    """Payload for farmer profile editing via ProfileScreen (supports partial updates)."""
    crop: Optional[str] = Field(None, min_length=2, description="Primary crop cultivated (must be in canonical 22 crops)")
    land_size: Optional[float] = Field(None, gt=0, description="Total cultivated land area (must be greater than 0)")
    land_unit: Optional[Literal["acres", "hectares", "bigha"]] = Field(None, description="Land unit measurement")
    location: Optional[str] = Field(None, min_length=2, max_length=255, description="Free-text or geocoded farm location label")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Optional GPS latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Optional GPS longitude coordinate")

    full_name: Optional[str] = Field(None, max_length=150, description="Farmer's full name")
    farming_type: Optional[Literal["Organic", "Conventional"]] = Field(None, description="Type of farming practiced")
    soil_type: Optional[str] = Field(None, max_length=100, description="Soil classification")
    preferred_language: Optional[Literal["hi", "en", "te", "mr", "gu", "ta"]] = Field(None, description="Preferred app language code")
    units_preference: Optional[Literal["quintals-acres", "kg-hectares"]] = Field(None, description="Preferred display units")
    sms_notifications_enabled: Optional[bool] = Field(None, description="SMS notifications preference toggle (stored only)")

    @field_validator("crop")
    @classmethod
    def validate_crop(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        norm = v.strip().lower()
        if norm not in VALID_CROPS_SET:
            valid_list = ", ".join(sorted(VALID_CROPS))
            raise ValueError(f"Crop '{v}' is not recognized. Must be one of: {valid_list}")
        return norm


class FarmProfileResponse(BaseModel):
    """Complete serialized farm profile record."""
    id: int = Field(..., description="Unique profile identifier")
    user_id: int = Field(..., description="Foreign key identifying the owning farmer")
    crop: str = Field(..., description="Primary cultivated crop")
    land_size: float = Field(..., description="Cultivated land size")
    land_unit: str = Field(..., description="Unit of land size")
    location: str = Field(..., description="Farm location description")
    latitude: Optional[float] = Field(None, description="GPS latitude coordinate")
    longitude: Optional[float] = Field(None, description="GPS longitude coordinate")
    full_name: Optional[str] = Field(None, description="Farmer full name")
    farming_type: Optional[str] = Field(None, description="Farming methodology")
    soil_type: Optional[str] = Field(None, description="Soil classification")
    preferred_language: str = Field(..., description="Language preference code")
    units_preference: str = Field(..., description="Units preference code")
    sms_notifications_enabled: bool = Field(..., description="SMS notification preference flag")
    created_at: datetime = Field(..., description="Timestamp of profile creation")
    updated_at: datetime = Field(..., description="Timestamp of most recent update")

    model_config = ConfigDict(from_attributes=True)


class ValidCropsResponse(BaseModel):
    """Helper response exposing the canonical 22 supported crops to the frontend."""
    valid_crops: List[str] = Field(..., description="List of 22 supported canonical crops")
