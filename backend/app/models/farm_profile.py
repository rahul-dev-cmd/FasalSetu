"""
SQLAlchemy Model for Farm Profile
=================================
Represents a farmer's farm and operational details, established during onboarding
(FarmDetailsScreen) and editable later (ProfileScreen).
Enforces a 1-to-1 relationship per farmer via a database unique constraint on user_id.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class FarmProfile(Base):
    __tablename__ = "farm_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Core farm characteristics (Onboarding / FarmDetailsScreen)
    crop = Column(String(100), nullable=False)
    land_size = Column(Float, nullable=False)
    land_unit = Column(String(50), nullable=False)  # "acres", "hectares", "bigha"
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Farmer profile & operational preferences (ProfileScreen)
    full_name = Column(String(150), nullable=True)
    farming_type = Column(String(50), nullable=True)  # "Organic", "Conventional"
    soil_type = Column(String(100), nullable=True)
    preferred_language = Column(String(20), default="en", nullable=False)  # "hi", "en", "te", "mr", "gu", "ta"
    units_preference = Column(String(50), default="quintals-acres", nullable=False)  # "quintals-acres", "kg-hectares"
    sms_notifications_enabled = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    user = relationship("User", backref="farm_profile")

    def __repr__(self):
        return f"<FarmProfile(id={self.id}, user_id={self.user_id}, crop='{self.crop}', location='{self.location}')>"
