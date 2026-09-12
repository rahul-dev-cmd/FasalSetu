"""
Pydantic Schemas for Feature 17: Deal Transactions & Lifecycle Tracking
======================================================================
"""

from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class TransactionAdvanceRequest(BaseModel):
    action: Literal["confirm_pickup", "confirm_payment"] = Field(
        ...,
        description="Manual stage advancement action performed by the listing farmer."
    )


class TransactionStage(BaseModel):
    stage: str = Field(..., description="Stage identifier (matched, negotiated, logistics, payment, completed)")
    status: str = Field(..., description="Stage status (completed, active, pending)")
    label: str = Field(..., description="Human-readable title/label for this stage")
    subtext: Optional[str] = Field(None, description="Descriptive subtext or status detail")
    target_date: Optional[datetime] = Field(None, description="Display target date for this stage")
    completed_at: Optional[datetime] = Field(None, description="Timestamp when stage was completed")


class TransactionResponse(BaseModel):
    id: int
    listing_id: int
    offer_id: int
    farmer_id: int
    buyer_id: int
    agreed_price: float
    pickup_target_date: datetime
    payment_target_date: datetime
    logistics_status: str
    payment_status: str
    overall_status: str
    logistics_completed_at: Optional[datetime] = None
    payment_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    stages: List[TransactionStage]

    model_config = ConfigDict(from_attributes=True)
