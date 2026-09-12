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
from app.schemas.feedback import (
    FeedbackSubmitRequest,
    FeedbackResponse
)
from app.schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    AuthTokenResponse
)
from app.schemas.negotiation_chat import (
    NegotiationChatRequest,
    NegotiationChatResponse
)
from app.schemas.irrigation import IrrigationAdvisoryResponse
from app.schemas.yield_estimate import YieldEstimateResponse
from app.schemas.farm_profile import (
    FarmProfileCreateRequest,
    FarmProfileUpdateRequest,
    FarmProfileResponse,
    ValidCropsResponse
)
from app.schemas.buyer_profile import (
    BuyerProfileCreateRequest,
    BuyerProfileUpdateRequest,
    BuyerProfileResponse,
    BuyerProfilePublicResponse
)
from app.schemas.transaction import (
    TransactionAdvanceRequest,
    TransactionStage,
    TransactionResponse,
)
from app.schemas.risk_map import (
    HotspotListItemResponse,
    HotspotDetailResponse,
    MapMarkerResponse,
    DistrictZoneResponse,
    RiskMapFiltersResponse,
)
from app.schemas.report import (
    ReportGenerateRequest,
    ReportResponse,
    ReportListItemResponse,
)
from app.schemas.intervention import (
    InterventionCreate,
    InterventionUpdate,
    InterventionStatusPatch,
    InterventionResponse,
    InterventionStatsResponse,
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
    "FarmerVoiceQAResponse",
    "FeedbackSubmitRequest",
    "FeedbackResponse",
    "UserSignupRequest",
    "UserLoginRequest",
    "UserResponse",
    "AuthTokenResponse",
    "NegotiationChatRequest",
    "NegotiationChatResponse",
    "IrrigationAdvisoryResponse",
    "YieldEstimateResponse",
    "FarmProfileCreateRequest",
    "FarmProfileUpdateRequest",
    "FarmProfileResponse",
    "ValidCropsResponse",
    "BuyerProfileCreateRequest",
    "BuyerProfileUpdateRequest",
    "BuyerProfileResponse",
    "BuyerProfilePublicResponse",
    "TransactionAdvanceRequest",
    "TransactionStage",
    "TransactionResponse",
    "HotspotListItemResponse",
    "HotspotDetailResponse",
    "MapMarkerResponse",
    "DistrictZoneResponse",
    "RiskMapFiltersResponse",
    "ReportGenerateRequest",
    "ReportResponse",
    "ReportListItemResponse",
    "InterventionCreate",
    "InterventionUpdate",
    "InterventionStatusPatch",
    "InterventionResponse",
    "InterventionStatsResponse",
]

