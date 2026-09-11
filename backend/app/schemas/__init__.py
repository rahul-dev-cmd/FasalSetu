"""FasalSetu Schemas Package."""
from app.schemas.health import HealthResponse
from app.schemas.crop_recommendation import (
    CropRecommendationRequest,
    AlternativeCrop,
    CropRecommendationResponse,
    ErrorResponse
)
from app.schemas.market_price import (
    MarketPriceItem,
    MarketPriceResponse
)
from app.schemas.farmer_qa import (
    FarmerQARequest,
    FarmerQAResponse,
    FarmerVoiceQAResponse
)

__all__ = [
    "HealthResponse",
    "CropRecommendationRequest",
    "AlternativeCrop",
    "CropRecommendationResponse",
    "ErrorResponse",
    "MarketPriceItem",
    "MarketPriceResponse",
    "FarmerQARequest",
    "FarmerQAResponse",
    "FarmerVoiceQAResponse"
]
