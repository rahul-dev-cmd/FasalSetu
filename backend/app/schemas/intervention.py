"""
Pydantic Schemas for Government Interventions (Feature 15d)
============================================================
Defines data structures for creating, updating, status-patching,
and querying command center interventions. Supports both snake_case
and camelCase fields for seamless frontend compatibility.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ActivityLogEntrySchema(BaseModel):
    time: str = Field(..., description="Timestamp label (e.g. '12 Sept, 10:30 AM')")
    text: str = Field(..., description="Activity log message")
    author: str = Field(..., description="Official or system author (e.g. 'AI Surveillance Core')")


class InterventionCreate(BaseModel):
    district: str = Field(..., min_length=2, max_length=100)
    mandal: str = Field(..., min_length=2, max_length=255)
    crop: str = Field(..., min_length=2, max_length=100)
    issue_type: str = Field(..., description="Disease, Pest, Water Stress, Waterlogging, Crop Concentration")
    risk_level: str = Field(..., description="High, Medium, Low")
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    status: Optional[str] = Field("Pending", description="Pending, In Progress, Completed")
    team: Optional[str] = None
    team_lead: Optional[str] = None
    team_contact: Optional[str] = None
    due_date: Optional[str] = Field(None, description="Due date string or label")
    affected_hectares: Optional[float] = 0.0
    farmers_count: Optional[int] = 0


class InterventionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    team: Optional[str] = None
    team_lead: Optional[str] = None
    team_contact: Optional[str] = None
    progress_percent: Optional[int] = Field(None, ge=0, le=100)
    due_date: Optional[str] = None
    resolved_by: Optional[str] = None
    affected_hectares: Optional[float] = None
    farmers_count: Optional[int] = None
    new_activity_log_entry: Optional[ActivityLogEntrySchema] = None


class InterventionStatusPatch(BaseModel):
    status: str = Field(..., description="Pending, In Progress, Completed")
    resolved_by: Optional[str] = Field(None, description="Resolver team or official name")
    progress_percent: Optional[int] = Field(None, ge=0, le=100)
    log_message: Optional[str] = Field(None, description="Optional log entry text")


class InterventionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    intervention_uid: str = Field(..., serialization_alias="id")
    district: str
    mandal: str
    crop: str
    issue_type: str = Field(..., serialization_alias="issueType")
    risk_level: str = Field(..., serialization_alias="riskLevel")
    title: str
    description: str
    status: str
    team: Optional[str] = None
    team_lead: Optional[str] = Field(None, serialization_alias="teamLead")
    team_contact: Optional[str] = Field(None, serialization_alias="teamContact")
    team_avatar: Optional[str] = Field(None, serialization_alias="teamAvatar")
    progress_percent: Optional[int] = Field(0, serialization_alias="progressPercent")
    due_date: str = Field(..., serialization_alias="dueDate")
    started_date: Optional[str] = Field(None, serialization_alias="startedDate")
    completed_date: Optional[str] = Field(None, serialization_alias="completedDate")
    resolved_by: Optional[str] = Field(None, serialization_alias="resolvedBy")
    affected_hectares: float = Field(0.0, serialization_alias="affectedHectares")
    farmers_count: int = Field(0, serialization_alias="farmersCount")
    activity_log: List[ActivityLogEntrySchema] = Field(default_factory=list, serialization_alias="activityLog")
    created_at: datetime
    updated_at: datetime


class InterventionStatsResponse(BaseModel):
    total_interventions: int
    pending_count: int
    in_progress_count: int
    completed_count: int
    total_affected_hectares: float
    total_farmers_impacted: int
    teams_deployed_count: int
