"""
FasalSetu Government Risk Map Router
=====================================
API endpoints for Feature 15b: Government Command Center Risk Map & Hotspots.

Prefix: /government/risk-map
All endpoints require a valid government JWT (role="government").
Farmer and Buyer roles are rejected with 403 Forbidden.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.risk_map import Hotspot, MapMarker, DistrictZone
from app.schemas.risk_map import (
    HotspotListItemResponse,
    HotspotDetailResponse,
    MapMarkerResponse,
    DistrictZoneResponse,
    RiskMapFiltersResponse,
)
from app.db.seed_risk_map import STATIC_FILTERS

router = APIRouter(prefix="/government/risk-map", tags=["Government Risk Map"])


@router.get(
    "/filters",
    response_model=RiskMapFiltersResponse,
    summary="Get static risk map reference filters and legend categories"
)
def get_risk_map_filters(
    current_user: User = Depends(require_role("government")),
):
    """
    Returns static styling and filter reference options:
    - legendCategories (pest, disease, drought, weather)
    - cropFilterOptions
    - riskFilterOptions
    - timeFilterOptions
    """
    return STATIC_FILTERS


@router.get(
    "/hotspots",
    response_model=List[HotspotListItemResponse],
    summary="List agricultural risk hotspots sorted by rank"
)
def list_hotspots(
    crop: Optional[str] = Query(None, description="Optional crop filter (case-insensitive)"),
    risk_level: Optional[str] = Query(None, description="Optional risk level: High, Medium, Low (case-insensitive)"),
    time_range: str = Query("30d", description="Time range for trend array: 30d, 60d, 90d, this_season"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Retrieves all hotspots sorted by severity rank ascending.
    Supports filtering by crop and risk level.
    The time_range parameter selects which pre-computed historical trend array is returned:
    - 30d: 30-day historical trend
    - 60d: 60-day historical trend
    - 90d / this_season: 90-day historical trend
    """
    query = db.query(Hotspot)

    if crop:
        query = query.filter(func.lower(Hotspot.crop) == crop.strip().lower())

    if risk_level:
        query = query.filter(func.lower(Hotspot.risk_level) == risk_level.strip().lower())

    hotspots = query.order_by(Hotspot.rank.asc()).all()

    # Map historical trend array according to time_range
    normalized_time_range = time_range.strip().lower()
    results = []
    for h in hotspots:
        if normalized_time_range == "60d":
            trend_data = h.historical_trend_60d
        elif normalized_time_range in ("90d", "this_season"):
            trend_data = h.historical_trend_90d
        else:
            trend_data = h.historical_trend_30d

        item = HotspotListItemResponse(
            id=h.id,
            rank=h.rank,
            district=h.district,
            risk_level=h.risk_level,
            crop=h.crop,
            issue_type=h.issue_type,
            affected_area_label=h.affected_area_label,
            affected_area_ha=h.affected_area_ha,
            trend=h.trend,
            trend_label=h.trend_label,
            trend_percent=h.trend_percent,
            economic_impact_cr=h.economic_impact_cr,
            farmers_impacted=h.farmers_impacted,
            mandals_count=h.mandals_count,
            mandals_list=h.mandals_list or [],
            intervention_summary=h.intervention_summary,
            historical_trend=trend_data or [],
            map_position_x=h.map_position_x,
            map_position_y=h.map_position_y,
        )
        results.append(item)

    return results


@router.get(
    "/hotspots/{id}",
    response_model=HotspotDetailResponse,
    summary="Get full hotspot detail by ID"
)
def get_hotspot_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Retrieves full details for a single hotspot by ID,
    including the complete interventions list and all 3 historical trend ranges.
    """
    hotspot = db.query(Hotspot).filter(Hotspot.id == id).first()
    if not hotspot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hotspot with ID {id} not found."
        )

    return HotspotDetailResponse(
        id=hotspot.id,
        rank=hotspot.rank,
        district=hotspot.district,
        risk_level=hotspot.risk_level,
        crop=hotspot.crop,
        issue_type=hotspot.issue_type,
        affected_area_label=hotspot.affected_area_label,
        affected_area_ha=hotspot.affected_area_ha,
        trend=hotspot.trend,
        trend_label=hotspot.trend_label,
        trend_percent=hotspot.trend_percent,
        economic_impact_cr=hotspot.economic_impact_cr,
        farmers_impacted=hotspot.farmers_impacted,
        mandals_count=hotspot.mandals_count,
        mandals_list=hotspot.mandals_list or [],
        intervention_summary=hotspot.intervention_summary,
        interventions_list=hotspot.interventions_list or [],
        historical_trend_30d=hotspot.historical_trend_30d or [],
        historical_trend_60d=hotspot.historical_trend_60d or [],
        historical_trend_90d=hotspot.historical_trend_90d or [],
        map_position_x=hotspot.map_position_x,
        map_position_y=hotspot.map_position_y,
    )


@router.get(
    "/markers",
    response_model=List[MapMarkerResponse],
    summary="List map markers for stylized command center map"
)
def list_map_markers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Returns spatial coordinate markers for the command center stylized zone map.
    """
    markers = db.query(MapMarker).order_by(MapMarker.id.asc()).all()
    return markers


@router.get(
    "/district-zones",
    response_model=List[DistrictZoneResponse],
    summary="List district zones geometry for map background regions"
)
def list_district_zones(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Returns district zone polygonal bounding boxes and background classes
    for rendering regional map background areas.
    """
    zones = db.query(DistrictZone).order_by(DistrictZone.id.asc()).all()
    return zones
