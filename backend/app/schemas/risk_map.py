"""
FasalSetu Government Risk Map Schemas
=====================================
Pydantic response models for Feature 15b: Government Command Center Risk Map & Hotspots.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class HotspotListItemResponse(BaseModel):
    id: int
    rank: int
    district: str
    risk_level: str
    crop: str
    issue_type: str
    affected_area_label: str
    affected_area_ha: float
    trend: str
    trend_label: str
    trend_percent: float
    economic_impact_cr: float
    farmers_impacted: int
    mandals_count: int
    mandals_list: List[str]
    intervention_summary: str
    historical_trend: List[Any]
    map_position_x: float
    map_position_y: float

    model_config = ConfigDict(from_attributes=True)


class HotspotDetailResponse(BaseModel):
    id: int
    rank: int
    district: str
    risk_level: str
    crop: str
    issue_type: str
    affected_area_label: str
    affected_area_ha: float
    trend: str
    trend_label: str
    trend_percent: float
    economic_impact_cr: float
    farmers_impacted: int
    mandals_count: int
    mandals_list: List[str]
    intervention_summary: str
    interventions_list: List[str]
    historical_trend_30d: List[Any]
    historical_trend_60d: List[Any]
    historical_trend_90d: List[Any]
    map_position_x: float
    map_position_y: float

    model_config = ConfigDict(from_attributes=True)


class MapMarkerResponse(BaseModel):
    id: int
    x: float
    y: float
    size: float
    risk_level: str
    category: str
    district: str
    crop: str
    affected_area_label: str
    intervention: str

    model_config = ConfigDict(from_attributes=True)


class DistrictZoneResponse(BaseModel):
    id: int
    name: str
    x: float
    y: float
    width: float
    height: float
    bg_class: str

    model_config = ConfigDict(from_attributes=True)


class LegendCategoryItem(BaseModel):
    id: str
    label: str
    color: str


class TimeFilterOptionItem(BaseModel):
    id: str
    label: str


class RiskMapFiltersResponse(BaseModel):
    legendCategories: List[LegendCategoryItem]
    cropFilterOptions: List[str]
    riskFilterOptions: List[str]
    timeFilterOptions: List[TimeFilterOptionItem]
