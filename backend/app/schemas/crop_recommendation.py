"""
Crop Recommendation Schemas
===========================
Pydantic models for request validation and response serialization matching the exact API contract.
"""

from typing import List
from pydantic import BaseModel, Field, field_validator


class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(..., description="Nitrogen content in soil (N ratio)")
    phosphorus: float = Field(..., description="Phosphorus content in soil (P ratio)")
    potassium: float = Field(..., description="Potassium content in soil (K ratio)")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity percentage (0 to 100)")
    ph: float = Field(..., description="Soil pH value (0 to 14)")
    rainfall: float = Field(..., description="Rainfall in millimeters (mm)")

    @field_validator("ph")
    @classmethod
    def validate_ph(cls, v: float) -> float:
        if v < 0.0 or v > 14.0:
            raise ValueError("ph must be between 0 and 14")
        return v

    @field_validator("humidity")
    @classmethod
    def validate_humidity(cls, v: float) -> float:
        if v < 0.0 or v > 100.0:
            raise ValueError("humidity must be between 0 and 100")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "nitrogen": 90.0,
                "phosphorus": 42.0,
                "potassium": 43.0,
                "temperature": 20.87,
                "humidity": 82.0,
                "ph": 6.5,
                "rainfall": 202.93
            }
        }
    }


class AlternativeCrop(BaseModel):
    crop: str = Field(..., description="Name of alternative recommended crop")
    confidence: float = Field(..., description="Model confidence score between 0 and 1")


class CropRecommendationResponse(BaseModel):
    recommended_crop: str = Field(..., description="Top recommended crop for given soil and climate conditions")
    confidence: float = Field(..., description="Confidence probability for top recommendation (0 to 1)")
    alternatives: List[AlternativeCrop] = Field(..., description="Top 2 alternative crop options with confidence scores")

    model_config = {
        "json_schema_extra": {
            "example": {
                "recommended_crop": "rice",
                "confidence": 0.90,
                "alternatives": [
                    { "crop": "jute", "confidence": 0.10 },
                    { "crop": "coffee", "confidence": 0.0 }
                ]
            }
        }
    }


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Human-readable error description")

    model_config = {
        "json_schema_extra": {
            "example": {
                "error": "Failed to generate crop recommendation"
            }
        }
    }
