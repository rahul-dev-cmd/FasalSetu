"""
SQLAlchemy Models for Crop Listings & Offers (Price Negotiation)
===============================================================
Enables farmers to list crops for sale and buyers/farmers to submit
offers and counter-offers in an auditable negotiation thread.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False, default="kg")
    asking_price = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="open", index=True)  # open, negotiating, sold, withdrawn
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)

    farmer = relationship("User", foreign_keys=[farmer_id])
    offers = relationship(
        "CropOffer",
        back_populates="listing",
        cascade="all, delete-orphan",
        order_by="CropOffer.created_at.asc(), CropOffer.id.asc()"
    )

    def __repr__(self):
        return f"<CropListing(id={self.id}, farmer='{self.farmer_id}', crop='{self.crop}', status='{self.status}')>"


class CropOffer(Base):
    __tablename__ = "crop_offers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    made_by = Column(String(20), nullable=False)  # "farmer" or "buyer"
    status = Column(String(30), nullable=False, default="pending", index=True)  # pending, accepted, rejected, countered
    parent_offer_id = Column(Integer, ForeignKey("crop_offers.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)

    buyer = relationship("User", foreign_keys=[buyer_id])
    listing = relationship("CropListing", back_populates="offers")
    parent_offer = relationship("CropOffer", remote_side=[id], backref="counter_offers")

    __table_args__ = (
        Index("ix_crop_offers_listing_status", "listing_id", "status"),
    )

    def __repr__(self):
        return f"<CropOffer(id={self.id}, listing_id={self.listing_id}, made_by='{self.made_by}', amount={self.amount}, status='{self.status}')>"
