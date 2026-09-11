"""FasalSetu API Package."""
from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.crop_recommendation import router as crop_router
from app.api.market_price import router as market_price_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(crop_router, tags=["Crop Recommendation"])
api_router.include_router(market_price_router, tags=["Market Prices"])

__all__ = ["api_router"]
