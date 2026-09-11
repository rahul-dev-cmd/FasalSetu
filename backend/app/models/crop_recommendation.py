"""
SQLAlchemy Model for Crop Recommendation Logs
=============================================
Stores historical recommendation requests and outputs for audit, demo, and analytics.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, JSON
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class CropRecommendationLog(Base):
    __tablename__ = "crop_recommendation_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)
    
    # Input agronomic features
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    
    # Model prediction outputs
    recommended_crop = Column(String(100), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    alternatives = Column(JSON, nullable=False)

    def __repr__(self):
        return f"<CropRecommendationLog(id={self.id}, crop='{self.recommended_crop}', confidence={self.confidence})>"
