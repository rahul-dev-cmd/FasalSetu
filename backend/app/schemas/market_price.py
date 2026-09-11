"""
Market Price Schemas
====================
Pydantic schemas for the Market Price Comparison endpoint contract.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class MarketPriceItem(BaseModel):
    market_name: str = Field(..., description="Name of the agricultural mandi / market")
    state: str = Field(..., description="Indian state where mandi is located")
    district: str = Field(..., description="District where mandi is located")
    min_price: float = Field(..., description="Minimum recorded price for crop in Rs/quintal")
    max_price: float = Field(..., description="Maximum recorded price for crop in Rs/quintal")
    modal_price: float = Field(..., description="Modal (most common) price for crop in Rs/quintal")
    recorded_date: str = Field(..., description="Date of price recording in ISO format (YYYY-MM-DD)")
    distance_km: Optional[float] = Field(None, description="Distance in kilometers from farmer (null if no coords provided)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "market_name": "Khanna Mandi",
                "state": "Punjab",
                "district": "Ludhiana",
                "min_price": 3250.0,
                "max_price": 3820.0,
                "modal_price": 3550.0,
                "recorded_date": "2026-09-11",
                "distance_km": None
            }
        }
    }


class MarketPriceResponse(BaseModel):
    crop: str = Field(..., description="Queried crop name")
    markets: List[MarketPriceItem] = Field(default_factory=list, description="List of markets sorted by modal price descending")
    best_price_market: Optional[str] = Field(None, description="Market name offering the highest modal price, or null if no markets match")

    model_config = {
        "json_schema_extra": {
            "example": {
                "crop": "rice",
                "markets": [
                    {
                        "market_name": "Khanna Mandi",
                        "state": "Punjab",
                        "district": "Ludhiana",
                        "min_price": 3250.0,
                        "max_price": 3820.0,
                        "modal_price": 3550.0,
                        "recorded_date": "2026-09-11",
                        "distance_km": None
                    }
                ],
                "best_price_market": "Khanna Mandi"
            }
        }
    }
