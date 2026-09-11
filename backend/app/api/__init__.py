"""FasalSetu API Package."""
from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.crop_recommendation import router as crop_router
from app.api.market_price import router as market_price_router
from app.api.farmer_qa import router as farmer_qa_router
from app.api.crop_diagnosis import router as crop_diagnosis_router
from app.api.listing import router as listing_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(crop_router, tags=["Crop Recommendation"])
api_router.include_router(market_price_router, tags=["Market Prices"])
api_router.include_router(farmer_qa_router, tags=["Farmer Q&A Assistant"])
api_router.include_router(crop_diagnosis_router, tags=["Crop Diagnosis"])
api_router.include_router(listing_router, tags=["Price Negotiation"])

__all__ = ["api_router"]
