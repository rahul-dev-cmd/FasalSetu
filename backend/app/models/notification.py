"""
SQLAlchemy Model for User Notifications & Alerts
================================================
Tracks polling-based notifications for farmers and buyers regarding offers,
negotiation decisions, and transaction stage transitions.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(String(500), nullable=False)
    notification_type = Column(String(50), nullable=False, index=True)  # "new_offer", "offer_response", "transaction_update"
    related_id = Column(Integer, nullable=True, index=True)  # offer_id, transaction_id, listing_id
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)

    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        Index("ix_notifications_user_unread", "user_id", "is_read"),
        Index("ix_notifications_user_created", "user_id", "created_at"),
    )

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.notification_type}', is_read={self.is_read})>"
