"""
Pydantic Schemas for Feature 13: Yield & Harvest Estimate
=========================================================
Defines the serialization response model matching the frontend YieldEstimateScreen
contract for benchmark-derived crop yield, harvest window, and profit projections.
"""

from typing import Optional
from pydantic import BaseModel, Field


class YieldEstimateResponse(BaseModel):
    field_name: str = Field(
        ...,
        description="Farmer-provided label or identifier for the field/plot (e.g. 'Main Field (Paddy Plot A)')"
    )
    crop_name: str = Field(
        ...,
        description="Crop evaluated (must be one of 22 canonical supported crops)"
    )
    last_updated: str = Field(
        ...,
        description="ISO-8601 UTC timestamp when this estimate was calculated"
    )
    expected_yield_min: float = Field(
        ...,
        description="Estimated minimum harvest yield for the field in quintals (benchmark min × acres)"
    )
    expected_yield_max: float = Field(
        ...,
        description="Estimated maximum harvest yield for the field in quintals (benchmark max × acres)"
    )
    yield_unit: str = Field(
        default="quintals",
        description="Standard unit of yield measurement (quintals)"
    )
    harvest_window_start: str = Field(
        ...,
        description="Estimated earliest harvest window date in ISO format (YYYY-MM-DD)"
    )
    harvest_window_end: str = Field(
        ...,
        description="Estimated latest harvest window date in ISO format (YYYY-MM-DD)"
    )
    harvest_eta: str = Field(
        ...,
        description="Human-readable relative time string indicating distance to harvest window (e.g. 'in 2–3 months')"
    )
    estimated_value_min: Optional[float] = Field(
        default=None,
        description="Estimated minimum gross crop value in ₹ based on market modal price (null if price unavailable)"
    )
    estimated_value_max: Optional[float] = Field(
        default=None,
        description="Estimated maximum gross crop value in ₹ based on market modal price (null if price unavailable)"
    )
    progress_percent: int = Field(
        ...,
        ge=0,
        le=100,
        description="Estimated crop growth cycle progress percentage capped at 100%"
    )
    tracking_status: str = Field(
        ...,
        description="Milestone status ('On track', 'In harvest window', 'Behind schedule', 'Ready for harvest')"
    )
    health_factor: str = Field(
        ...,
        description="Generic growth-stage description corresponding to current progress band (not an IoT crop health diagnosis)"
    )
    projected_profit_per_acre: Optional[float] = Field(
        default=None,
        description="Compounded net profit projection per acre (revenue minus category cost ratio). Note: carries higher uncertainty than yield range alone."
    )
    price_data_available: bool = Field(
        ...,
        description="True if recorded mandi market prices were found for this crop/state, false otherwise"
    )
    is_estimate: bool = Field(
        default=True,
        description="Explicit indicator confirming benchmark estimation rather than hardware sensor measurement"
    )
