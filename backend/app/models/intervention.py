"""
SQLAlchemy Model for Government Interventions (Feature 15d)
============================================================
Tracks administrative agricultural intervention operations, field responses,
and crisis containment tasks displayed on the Command Center Kanban board.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, JSON
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    intervention_uid = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "int-1"
    district = Column(String(100), nullable=False, index=True)
    mandal = Column(String(255), nullable=False)
    crop = Column(String(100), nullable=False, index=True)
    issue_type = Column(String(100), nullable=False, index=True)  # Disease, Pest, Water Stress, Waterlogging, Crop Concentration
    risk_level = Column(String(50), nullable=False, index=True)   # High, Medium, Low
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, index=True, default="Pending")  # "Pending", "In Progress", "Completed"
    team = Column(String(100), nullable=True, index=True)  # "Field Team 2" or None
    team_lead = Column(String(100), nullable=True)
    team_contact = Column(String(50), nullable=True)
    team_avatar = Column(String(20), nullable=True)
    progress_percent = Column(Integer, default=0, nullable=False)
    due_date = Column(String(100), nullable=False)
    started_date = Column(String(100), nullable=True)
    completed_date = Column(String(100), nullable=True)
    resolved_by = Column(String(100), nullable=True)
    affected_hectares = Column(Float, nullable=False, default=0.0)
    farmers_count = Column(Integer, nullable=False, default=0)
    activity_log = Column(JSON, nullable=False, default=list)  # List[Dict[str, str]] with time, text, author
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
