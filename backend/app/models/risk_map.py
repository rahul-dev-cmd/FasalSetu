"""
FasalSetu Government Risk Map Models
=====================================
Database models for Feature 15b: Government Command Center Risk Map & Hotspots.

Tables:
- hotspots: Agricultural risk hotspots with severity, acreage, crop, trends, and intervention tracking.
- map_markers: Visual markers plotted on the stylized command center district map.
- district_zones: Regional boundary boxes and styling for map background visualization.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, JSON
from app.core.database import Base


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rank = Column(Integer, nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    risk_level = Column(String(20), nullable=False, index=True)  # "High", "Medium", "Low"
    crop = Column(String(50), nullable=False, index=True)
    issue_type = Column(String(150), nullable=False)
    affected_area_label = Column(String(100), nullable=False)
    affected_area_ha = Column(Float, nullable=False)
    trend = Column(String(20), nullable=False)  # "up", "stable", "down"
    trend_label = Column(String(100), nullable=False)
    trend_percent = Column(Float, nullable=False)
    economic_impact_cr = Column(Float, nullable=False)
    farmers_impacted = Column(Integer, nullable=False)
    mandals_count = Column(Integer, nullable=False)
    mandals_list = Column(JSON, nullable=False)  # List[str]
    intervention_summary = Column(Text, nullable=False)
    interventions_list = Column(JSON, nullable=False)  # List[str]
    historical_trend_30d = Column(JSON, nullable=False)  # List[Dict] or List[float/int]
    historical_trend_60d = Column(JSON, nullable=False)  # List[Dict] or List[float/int]
    historical_trend_90d = Column(JSON, nullable=False)  # List[Dict] or List[float/int]
    map_position_x = Column(Float, nullable=False)
    map_position_y = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class MapMarker(Base):
    __tablename__ = "map_markers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    size = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)  # "High", "Medium", "Low"
    category = Column(String(50), nullable=False)
    district = Column(String(100), nullable=False)
    crop = Column(String(50), nullable=False)
    affected_area_label = Column(String(100), nullable=False)
    intervention = Column(Text, nullable=False)


class DistrictZone(Base):
    __tablename__ = "district_zones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    bg_class = Column(String(100), nullable=False)
