"""
FasalSetu Government Interventions Router (Feature 15d)
======================================================
API endpoints for managing administrative field interventions, crisis containment,
and Kanban-style status tracking on the Government Command Center dashboard.

Prefix: /government/interventions
All modifying endpoints require a valid government JWT (role="government").
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.intervention import Intervention
from app.schemas.intervention import (
    InterventionCreate,
    InterventionUpdate,
    InterventionStatusPatch,
    InterventionResponse,
    InterventionStatsResponse,
    ActivityLogEntrySchema,
)

router = APIRouter(prefix="/government/interventions", tags=["Government Interventions"])


def _find_intervention_by_id_or_uid(db: Session, identifier: str) -> Optional[Intervention]:
    """Finds an intervention either by numeric PK ID or string intervention_uid ('int-1')."""
    if identifier.isdigit():
        item = db.query(Intervention).filter(Intervention.id == int(identifier)).first()
        if item:
            return item
    return db.query(Intervention).filter(Intervention.intervention_uid == identifier).first()


@router.get(
    "",
    response_model=List[InterventionResponse],
    summary="List all government interventions with optional filtering",
)
def list_interventions(
    district: Optional[str] = Query(None, description="Optional district filter"),
    team: Optional[str] = Query(None, description="Optional field team filter"),
    category: Optional[str] = Query(None, description="Optional issue category filter"),
    status_filter: Optional[str] = Query(None, alias="status", description="Optional status filter: Pending, In Progress, Completed"),
    crop: Optional[str] = Query(None, description="Optional crop filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Returns all agricultural crisis containment interventions.
    Supports filtering by district, team, issue category, status, and crop.
    Requires role="government".
    """
    query = db.query(Intervention)

    if district and district.lower() != "all districts":
        query = query.filter(func.lower(Intervention.district) == district.strip().lower())

    if team and team.lower() != "all teams":
        if team.lower() == "unassigned":
            query = query.filter((Intervention.team.is_(None)) | (Intervention.team == ""))
        else:
            query = query.filter(Intervention.team.ilike(f"%{team.strip()}%"))

    if category and category.lower() != "all issues":
        query = query.filter(func.lower(Intervention.issue_type) == category.strip().lower())

    if status_filter and status_filter.lower() != "all":
        # Normalize status comparison
        s_clean = status_filter.strip().lower()
        if s_clean in ["pending", "in progress", "completed"]:
            query = query.filter(func.lower(Intervention.status) == s_clean)
        elif s_clean == "in_progress":
            query = query.filter(func.lower(Intervention.status) == "in progress")

    if crop and crop.lower() != "all crops":
        query = query.filter(func.lower(Intervention.crop) == crop.strip().lower())

    return query.order_by(Intervention.id.asc()).all()


@router.get(
    "/stats",
    response_model=InterventionStatsResponse,
    summary="Get aggregated statistics for command center interventions",
)
def get_intervention_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Returns summary counters and impacted land/farmer totals across all interventions.
    """
    all_items = db.query(Intervention).all()

    total = len(all_items)
    pending_count = sum(1 for i in all_items if (i.status or "").lower() == "pending")
    in_progress_count = sum(1 for i in all_items if (i.status or "").lower() in ["in progress", "in_progress"])
    completed_count = sum(1 for i in all_items if (i.status or "").lower() == "completed")
    total_hectares = sum(i.affected_hectares or 0.0 for i in all_items)
    total_farmers = sum(i.farmers_count or 0 for i in all_items)

    teams = set(i.team for i in all_items if i.team)

    return InterventionStatsResponse(
        total_interventions=total,
        pending_count=pending_count,
        in_progress_count=in_progress_count,
        completed_count=completed_count,
        total_affected_hectares=round(total_hectares, 1),
        total_farmers_impacted=total_farmers,
        teams_deployed_count=len(teams),
    )


@router.get(
    "/{id_or_uid}",
    response_model=InterventionResponse,
    summary="Get single intervention details",
)
def get_intervention_detail(
    id_or_uid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Retrieves full details of a specific intervention by ID or UID (e.g. 'int-1').
    """
    item = _find_intervention_by_id_or_uid(db, id_or_uid)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Intervention '{id_or_uid}' not found.",
        )
    return item


@router.post(
    "",
    response_model=InterventionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new government field intervention",
)
def create_intervention(
    payload: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Registers a new crisis containment intervention action plan.
    Auto-generates a unique intervention UID and initializes the activity log.
    Requires role="government".
    """
    # Generate UID
    max_id = db.query(func.max(Intervention.id)).scalar() or 0
    next_uid = f"int-{max_id + 1}"

    now_str = datetime.now().strftime("%d %b, %I:%M %p")
    author_name = current_user.name or f"Officer {current_user.phone[-4:]}"

    initial_log = [
        {
            "time": now_str,
            "text": f"Intervention requisition registered: {payload.title}",
            "author": author_name,
        }
    ]

    # Normalize status
    st = payload.status or "Pending"
    if st.lower() == "in_progress":
        st = "In Progress"
    elif st.lower() == "completed":
        st = "Completed"
    else:
        st = "Pending"

    due_date_val = payload.due_date or "In 3 days"

    new_item = Intervention(
        intervention_uid=next_uid,
        district=payload.district.strip(),
        mandal=payload.mandal.strip(),
        crop=payload.crop.strip(),
        issue_type=payload.issue_type.strip(),
        risk_level=payload.risk_level.strip(),
        title=payload.title.strip(),
        description=payload.description.strip(),
        status=st,
        team=payload.team.strip() if payload.team else None,
        team_lead=payload.team_lead.strip() if payload.team_lead else None,
        team_contact=payload.team_contact.strip() if payload.team_contact else None,
        team_avatar=payload.team[:3].upper() if payload.team else None,
        progress_percent=0 if st == "Pending" else 15,
        due_date=due_date_val,
        affected_hectares=payload.affected_hectares or 0.0,
        farmers_count=payload.farmers_count or 0,
        activity_log=initial_log,
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.patch(
    "/{id_or_uid}",
    response_model=InterventionResponse,
    summary="Update intervention fields or advance Kanban status",
)
def update_intervention(
    id_or_uid: str,
    payload: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Updates intervention details or advances status along the Kanban board:
    - Automatically updates started_date when moved to 'In Progress'.
    - Automatically updates completed_date and resolved_by when moved to 'Completed'.
    - Appends optional activity log entry with timestamp.
    """
    item = _find_intervention_by_id_or_uid(db, id_or_uid)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Intervention '{id_or_uid}' not found.",
        )

    author_name = current_user.name or f"Officer {current_user.phone[-4:]}"
    now_str = datetime.now().strftime("%d %b, %I:%M %p")

    # Update basic fields if provided
    if payload.title is not None:
        item.title = payload.title.strip()
    if payload.description is not None:
        item.description = payload.description.strip()
    if payload.team is not None:
        item.team = payload.team.strip() if payload.team else None
        item.team_avatar = payload.team[:3].upper() if payload.team else None
    if payload.team_lead is not None:
        item.team_lead = payload.team_lead.strip()
    if payload.team_contact is not None:
        item.team_contact = payload.team_contact.strip()
    if payload.progress_percent is not None:
        item.progress_percent = payload.progress_percent
    if payload.due_date is not None:
        item.due_date = payload.due_date
    if payload.affected_hectares is not None:
        item.affected_hectares = payload.affected_hectares
    if payload.farmers_count is not None:
        item.farmers_count = payload.farmers_count

    # Handle status change with Kanban lifecycle logic
    if payload.status is not None:
        st_clean = payload.status.strip().lower()
        if st_clean in ["in progress", "in_progress"]:
            target_status = "In Progress"
            if not item.started_date:
                item.started_date = f"Started on {now_str}"
            if item.progress_percent == 0:
                item.progress_percent = 25
        elif st_clean == "completed":
            target_status = "Completed"
            item.completed_date = datetime.now().strftime("%d %b %Y")
            item.resolved_by = payload.resolved_by or item.team or author_name
            item.due_date = "Resolved"
            item.progress_percent = 100
        else:
            target_status = "Pending"

        if item.status != target_status:
            log_entry = {
                "time": now_str,
                "text": f"Status updated from '{item.status}' to '{target_status}'.",
                "author": author_name,
            }
            current_log = list(item.activity_log or [])
            current_log.append(log_entry)
            item.activity_log = current_log
            item.status = target_status

    # Append custom log entry if provided
    if payload.new_activity_log_entry:
        current_log = list(item.activity_log or [])
        current_log.append({
            "time": payload.new_activity_log_entry.time or now_str,
            "text": payload.new_activity_log_entry.text,
            "author": payload.new_activity_log_entry.author or author_name,
        })
        item.activity_log = current_log

    db.commit()
    db.refresh(item)
    return item


@router.patch(
    "/{id_or_uid}/status",
    response_model=InterventionResponse,
    summary="Drag-and-drop status patch for Kanban board",
)
def patch_intervention_status(
    id_or_uid: str,
    payload: InterventionStatusPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Dedicated endpoint optimized for Kanban drag-and-drop actions.
    """
    update_data = InterventionUpdate(
        status=payload.status,
        resolved_by=payload.resolved_by,
        progress_percent=payload.progress_percent,
    )
    if payload.log_message:
        update_data.new_activity_log_entry = ActivityLogEntrySchema(
            time=datetime.now().strftime("%d %b, %I:%M %p"),
            text=payload.log_message,
            author=current_user.name or f"Officer {current_user.phone[-4:]}",
        )
    return update_intervention(id_or_uid, update_data, db, current_user)


@router.delete(
    "/{id_or_uid}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete or cancel an intervention",
)
def delete_intervention(
    id_or_uid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """
    Removes an intervention record from the database.
    Requires role="government".
    """
    item = _find_intervention_by_id_or_uid(db, id_or_uid)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Intervention '{id_or_uid}' not found.",
        )
    db.delete(item)
    db.commit()
    return None
