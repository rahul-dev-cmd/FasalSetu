"""
SQLAlchemy Model for Buyer Company Profile
==========================================
Represents a buyer's company identity, tags, location, and starter reputation metrics.
Enforces a 1-to-1 relationship per buyer via a database unique constraint on user_id.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    company_name = Column(String(255), nullable=False)
    tags = Column(JSON, nullable=False)  # Stored as a JSON list of strings
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Demo simplifications: auto-verified on creation, seeded rating & review count
    verified = Column(Boolean, default=True, nullable=False)
    rating = Column(Float, nullable=False)
    review_count = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    user = relationship("User", backref="buyer_profile")

    def __repr__(self):
        return f"<BuyerProfile(id={self.id}, user_id={self.user_id}, company_name='{self.company_name}')>"
