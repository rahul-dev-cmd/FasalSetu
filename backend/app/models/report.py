"""
FasalSetu Government Reports Model
==================================
Database model for Feature 15c: Government Report Generation (PDF/Excel/CSV).
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False, index=True)  # "Risk Summary", "Crop Health", "Yield Forecast", "Intervention Log"
    district = Column(String(100), nullable=False, index=True)  # e.g. "Warangal", "All Districts"
    date_generated = Column(String(100), nullable=False)
    format = Column(String(20), nullable=False, index=True)  # "PDF", "Excel", "CSV"
    file_size_bytes = Column(Integer, nullable=False)  # Real computed size on disk
    status = Column(String(50), nullable=False, default="Ready")  # Always "Ready"
    executive_summary = Column(Text, nullable=False)
    key_findings = Column(JSON, nullable=False)  # List[str]
    scope = Column(String(255), nullable=False)  # e.g. "Warangal District • Last 30 Days"
    file_path = Column(String(500), nullable=False)  # Server storage path
    is_placeholder_content = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
