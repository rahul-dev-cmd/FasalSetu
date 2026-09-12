"""
Pydantic Schemas for Feature 12: Water Irrigation Advisory
==========================================================
Defines request validation and response serialization models for weather-based
rule-estimated soil moisture and irrigation urgency.
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class IrrigationAdvisoryResponse(BaseModel):
    soil_moisture_level: Literal["low", "medium", "high"] = Field(
        ...,
        description="Categorical moisture level based on estimated soil hydration"
    )
    moisture_percent: int = Field(
        ...,
        ge=0,
        le=100,
        description="Estimated soil moisture percentage (0-100%)"
    )
    recommendation: str = Field(
        ...,
        description="Actionable irrigation scheduling recommendation"
    )
    urgency: Literal["monitor", "urgent", "ok"] = Field(
        ...,
        description="Irrigation urgency tier matching frontend design system (monitor, urgent, ok)"
    )
    tips: List[str] = Field(
        ...,
        description="Contextual agronomic water management tips based on weather and soil"
    )
    last_updated: str = Field(
        ...,
        description="ISO-8601 UTC timestamp of the weather calculation"
    )
    is_estimate: bool = Field(
        default=True,
        description="Explicit flag confirming this is a rule-based weather estimate, not a sensor measurement"
    )
    data_source: str = Field(
        default="Open-Meteo (weather-based estimate, not a direct soil sensor reading)",
        description="Attribution and disclaimer clarifying data origin"
    )
    crop: str = Field(
        ...,
        description="Crop for which the water requirement was evaluated"
    )
    soil_type: str = Field(
        ...,
        description="Soil type used for water retention modeling"
    )
    weather_summary: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Summary of weather metrics retrieved from Open-Meteo"
    )
