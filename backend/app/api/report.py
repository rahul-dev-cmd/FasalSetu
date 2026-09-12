"""FasalSetu Government Reports Router
====================================
API endpoints for Feature 15c: Government Report Generation (PDF/Excel/CSV).

Prefix: /government/reports
All endpoints require require_role("government") (403 for farmer/buyer).
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import (
    ReportGenerateRequest,
    ReportListItemResponse,
    ReportResponse,
)
from app.services.report_generator_service import (
    FORMAT_MIME_TYPES,
    create_report_file,
)

router = APIRouter(prefix="/government/reports", tags=["Government Reports"])


@router.get(
    "",
    response_model=List[ReportListItemResponse],
    summary="List all government surveillance reports with optional filtering",
)
def list_reports(
    type: Optional[str] = Query(None, description="Filter by report type"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    status: Optional[str] = Query(None, description="Filter by status (e.g. Ready)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """List historical reports filtered by type, district, and status."""
    query = db.query(Report)

    if type:
        query = query.filter(Report.type == type)
    if district:
        query = query.filter(Report.district == district)
    if status:
        query = query.filter(Report.status == status)

    reports = query.order_by(Report.id.desc()).all()
    return reports


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Get single report metadata and findings by ID",
)
def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """Retrieve detailed metadata and strategic key findings for a specific report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id {report_id} not found",
        )
    return report


@router.post(
    "/generate",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a new surveillance report (PDF/Excel/CSV) synchronously",
)
def generate_report(
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """Generate a physical report file on disk and save metadata record."""
    file_info = create_report_file(
        db=db,
        report_type=payload.type,
        district=payload.district,
        date_range=payload.date_range,
        format_type=payload.format,
    )

    new_report = Report(
        name=file_info["name"],
        type=file_info["type"],
        district=file_info["district"],
        date_generated=file_info["date_generated"],
        format=file_info["format"],
        file_size_bytes=file_info["file_size_bytes"],
        status="Ready",
        executive_summary=file_info["executive_summary"],
        key_findings=file_info["key_findings"],
        scope=file_info["scope"],
        file_path=file_info["file_path"],
        is_placeholder_content=file_info["is_placeholder_content"],
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


@router.get(
    "/{report_id}/download",
    summary="Download report binary/text file with proper MIME type",
)
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("government")),
):
    """Download the generated report file from disk."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id {report_id} not found",
        )

    file_path = Path(report.file_path)
    if not file_path.exists():
        # Regenerate if file missing from disk
        file_info = create_report_file(
            db=db,
            report_type=report.type,
            district=report.district,
            date_range="Last 30 Days",
            format_type=report.format,
            custom_date=report.date_generated,
        )
        report.file_path = file_info["file_path"]
        report.file_size_bytes = file_info["file_size_bytes"]
        db.commit()
        db.refresh(report)
        file_path = Path(report.file_path)

    media_type = FORMAT_MIME_TYPES.get(report.format, "application/octet-stream")
    file_name = file_path.name

    return FileResponse(
        path=str(file_path),
        filename=file_name,
        media_type=media_type,
    )
