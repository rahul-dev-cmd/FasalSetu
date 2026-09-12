"""
SQLAlchemy Model for User Authentication
========================================
Represents farmer and buyer user accounts with phone + hashed password credentials.
Enforces a composite unique constraint on (phone, role) allowing dual-role accounts.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String(15), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)  # "farmer", "buyer", or "government"
    name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("phone", "role", name="uq_user_phone_role"),
    )

    def __repr__(self):
        return f"<User(id={self.id}, phone='{self.phone}', role='{self.role}')>"
