"""
Pydantic Schemas for Feature 7: Price Negotiation
=================================================
Defines validation schemas for listings, initial offers, counter-offers,
and negotiation actions (accept/reject).
"""

from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict


class ListingCreate(BaseModel):
    crop: str = Field(..., min_length=2, description="Crop name (e.g. wheat, rice, tomato)")
    quantity: float = Field(..., gt=0, description="Quantity for sale (must be greater than 0)")
    unit: str = Field(default="kg", min_length=1, description="Unit of measurement (e.g. kg, quintal, ton)")
    asking_price: float = Field(..., gt=0, description="Total or per-unit asking price in INR (must be greater than 0)")
    farmer_id: str = Field(..., min_length=1, description="Farmer identifier (e.g. phone number or UUID)")

    @field_validator("crop")
    @classmethod
    def clean_crop(cls, v: str) -> str:
        clean = v.strip().lower()
        if not clean:
            raise ValueError("Crop name cannot be blank")
        return clean


class OfferCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Offer amount in INR (must be greater than 0)")
    made_by: Literal["farmer", "buyer"] = Field(..., description="Party making the offer ('farmer' or 'buyer')")
    buyer_id: str = Field(..., min_length=1, description="Buyer identifier (e.g. phone number or UUID)")
    parent_offer_id: Optional[int] = Field(default=None, description="ID of the previous offer being countered, if applicable")


class OfferActionRequest(BaseModel):
    action: Literal["accept", "reject"] = Field(..., description="Action to take on the pending offer ('accept' or 'reject')")


class OfferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    buyer_id: str
    amount: float
    made_by: str
    status: str
    parent_offer_id: Optional[int] = None
    created_at: datetime


class ListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: str
    crop: str
    quantity: float
    unit: str
    asking_price: float
    status: str
    created_at: datetime


class ListingDetailResponse(ListingResponse):
    offers: List[OfferResponse] = []
    round_count: int = 0
