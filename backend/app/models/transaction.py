"""
SQLAlchemy Model for Deal Transactions (Feature 17)
===================================================
Tracks post-acceptance lifecycle of a deal once an offer is accepted (listing status becomes 'sold').
Serves as a status board reflecting the 5 stages (matched, negotiated, logistics, payment, completed).
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    offer_id = Column(Integer, ForeignKey("crop_offers.id", ondelete="CASCADE"), nullable=False, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agreed_price = Column(Float, nullable=False)
    pickup_target_date = Column(DateTime(timezone=True), nullable=False)
    payment_target_date = Column(DateTime(timezone=True), nullable=False)
    logistics_status = Column(String(30), nullable=False, default="active", index=True)  # pending, active, completed
    payment_status = Column(String(30), nullable=False, default="pending", index=True)    # pending, active, completed
    overall_status = Column(String(30), nullable=False, default="in_progress", index=True)  # in_progress, completed
    logistics_completed_at = Column(DateTime(timezone=True), nullable=True)
    payment_completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    listing = relationship("CropListing", back_populates="transaction")
    offer = relationship("CropOffer")
    farmer = relationship("User", foreign_keys=[farmer_id])
    buyer = relationship("User", foreign_keys=[buyer_id])

    __table_args__ = (
        Index("ix_transactions_farmer_overall", "farmer_id", "overall_status"),
        Index("ix_transactions_buyer_overall", "buyer_id", "overall_status"),
    )

    def __repr__(self):
        return f"<Transaction(id={self.id}, listing_id={self.listing_id}, overall='{self.overall_status}')>"
