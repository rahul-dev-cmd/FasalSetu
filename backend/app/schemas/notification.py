"""
Pydantic Schemas for Notification & Alert Endpoints
===================================================
Defines request and response contracts for user notifications.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class NotificationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    notification_type: str
    related_id: Optional[int] = None
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    notifications: List[NotificationItem]


class UnreadCountResponse(BaseModel):
    count: int


class ReadAllResponse(BaseModel):
    status: str
    marked_read: int
