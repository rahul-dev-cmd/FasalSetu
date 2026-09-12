"""
FasalSetu Government Reports Schemas
====================================
Pydantic schemas for Feature 15c: Government Report Generation (PDF/Excel/CSV).
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ReportGenerateRequest(BaseModel):
    type: str = Field(..., description="Report type: Risk Summary, Crop Health, Yield Forecast, Intervention Log")
    district: str = Field(..., description="Target district name or 'All Districts'")
    date_range: str = Field(default="Last 30 Days", description="Date range descriptor (e.g. Last 7 Days, Last 30 Days, Last 90 Days, This Season)")
    format: str = Field(default="PDF", description="Export format: PDF, Excel, CSV")


class ReportResponse(BaseModel):
    id: int
    name: str
    type: str
    district: str
    date_generated: str
    format: str
    file_size_bytes: int
    status: str
    executive_summary: str
    key_findings: List[str]
    scope: str
    is_placeholder_content: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportListItemResponse(BaseModel):
    id: int
    name: str
    type: str
    district: str
    date_generated: str
    format: str
    file_size_bytes: int
    status: str
    scope: str
    is_placeholder_content: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
