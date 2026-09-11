"""FasalSetu Models Package."""
from app.models.crop_recommendation import CropRecommendationLog
from app.models.market import Market, MarketPrice

__all__ = ["CropRecommendationLog", "Market", "MarketPrice"]
