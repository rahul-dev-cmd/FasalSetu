"""
FastAPI Router for User Notifications & Alerts
==============================================
Polling-based notification endpoints allowing farmers and buyers to view
activity alerts (offers received/countered, deal acceptances, stage advances).
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import (
    NotificationItem,
    NotificationListResponse,
    UnreadCountResponse,
    ReadAllResponse,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_notifications(
    unread_only: Optional[bool] = Query(False, description="Filter for unread notifications only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the authenticated user's notifications, most recent first.
    Optionally filter by unread_only=true.
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))

    notifications = query.order_by(desc(Notification.created_at), desc(Notification.id)).all()
    return NotificationListResponse(
        notifications=[NotificationItem.model_validate(n) for n in notifications]
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns a count of unread notifications for the authenticated user.
    Lightweight endpoint optimized for badge/bell counters.
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read.is_(False)
    ).count()
    return UnreadCountResponse(count=count)


@router.patch("/read-all", response_model=ReadAllResponse)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Marks all notifications belonging to the authenticated user as read.
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read.is_(False)
    ).update({"is_read": True}, synchronize_session="fetch")
    db.commit()
    return ReadAllResponse(status="ok", marked_read=count)


@router.patch("/{notification_id}/read", response_model=NotificationItem)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Marks a single notification as read.
    Returns 404 if the notification does not exist or does not belong to the caller.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with id {notification_id} not found."
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return NotificationItem.model_validate(notification)
