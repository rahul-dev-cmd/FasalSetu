"""
SQLAlchemy Model for Negotiation Chat Assistant Audit Logs
==========================================================
Records every advisory conversation between farmers/buyers and the AI assistant
during active price negotiations, linked to the crop listing and authenticated user.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class NegotiationChatLog(Base):
    __tablename__ = "negotiation_chat_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "farmer" or "buyer"
    message = Column(Text, nullable=False)
    reply = Column(Text, nullable=False)
    market_context_used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)

    listing = relationship("CropListing", foreign_keys=[listing_id])
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<NegotiationChatLog(id={self.id}, listing_id={self.listing_id}, user_id={self.user_id}, role='{self.role}')>"
