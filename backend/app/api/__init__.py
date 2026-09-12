"""FasalSetu API Package."""
from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.crop_recommendation import router as crop_router
from app.api.market_price import router as market_price_router
from app.api.farmer_qa import router as farmer_qa_router
from app.api.crop_diagnosis import router as crop_diagnosis_router
from app.api.listing import router as listing_router, my_router
from app.api.feedback import router as feedback_router
from app.api.auth import router as auth_router
from app.api.irrigation import router as irrigation_router
from app.api.yield_estimate import router as yield_router
from app.api.farm_profile import router as farm_profile_router
from app.api.buyer_profile import router as buyer_profile_router
from app.api.transaction import router as transaction_router, my_transactions_router
from app.api.risk_map import router as risk_map_router
from app.api.report import router as report_router
from app.api.intervention import router as intervention_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(crop_router, tags=["Crop Recommendation"])
api_router.include_router(market_price_router, tags=["Market Prices"])
api_router.include_router(farmer_qa_router, tags=["Farmer Q&A Assistant"])
api_router.include_router(crop_diagnosis_router, tags=["Crop Diagnosis"])
api_router.include_router(listing_router, tags=["Price Negotiation"])
api_router.include_router(my_router, tags=["User Marketplace Views"])
api_router.include_router(feedback_router, tags=["Feedback"])
api_router.include_router(auth_router, tags=["Authentication"])
api_router.include_router(irrigation_router, tags=["Water Irrigation Advisory"])
api_router.include_router(yield_router, tags=["Yield & Harvest Estimate"])
api_router.include_router(farm_profile_router, tags=["Farm Profile"])
api_router.include_router(buyer_profile_router, tags=["Buyer Profile"])
api_router.include_router(transaction_router, tags=["Transaction Status"])
api_router.include_router(my_transactions_router, tags=["User Marketplace Views"])
api_router.include_router(risk_map_router, tags=["Government Risk Map"])
api_router.include_router(report_router, tags=["Government Reports"])
api_router.include_router(intervention_router, tags=["Government Interventions"])

__all__ = ["api_router"]

