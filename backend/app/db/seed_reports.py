"""FasalSetu Government Reports Seeder.

Populates 24 historical reports across all 4 report types and 3 formats:
- Risk Summary (6 reports: PDF, Excel, CSV)
- Crop Health (6 reports: PDF, Excel, CSV)
- Yield Forecast (6 reports: PDF, Excel, CSV, is_placeholder_content=True)
- Intervention Log (6 reports: PDF, Excel, CSV, is_placeholder_content=True)

Generates real physical files on disk under backend/storage/reports/ and captures
actual calculated file sizes (in bytes).

Idempotent: Skips if 24 or more reports are already present and files exist.
"""
from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models.report import Report
from app.services.report_generator_service import (
    create_report_file,
    get_storage_dir,
)

logger = logging.getLogger("fasalsetu_seed")

SEEDED_REPORTS_SPECS: list[dict[str, Any]] = [
    # 1 - 6: Risk Summary
    {
        "id": 1,
        "title": "Risk Summary - All Districts",
        "type": "Risk Summary",
        "district": "All Districts",
        "date_range": "Last 30 Days",
        "format": "PDF",
        "date": "2025-05-18",
    },
    {
        "id": 2,
        "title": "Risk Summary - Warangal",
        "type": "Risk Summary",
        "district": "Warangal",
        "date_range": "Last 7 Days",
        "format": "PDF",
        "date": "2025-05-17",
    },
    {
        "id": 3,
        "title": "Risk Summary - Nizamabad",
        "type": "Risk Summary",
        "district": "Nizamabad",
        "date_range": "Last 30 Days",
        "format": "Excel",
        "date": "2025-05-16",
    },
    {
        "id": 4,
        "title": "Risk Summary - Jagtial",
        "type": "Risk Summary",
        "district": "Jagtial",
        "date_range": "Last 60 Days",
        "format": "CSV",
        "date": "2025-05-14",
    },
    {
        "id": 5,
        "title": "Risk Summary - Karimnagar",
        "type": "Risk Summary",
        "district": "Karimnagar",
        "date_range": "Last 30 Days",
        "format": "PDF",
        "date": "2025-05-12",
    },
    {
        "id": 6,
        "title": "Risk Summary - Khammam",
        "type": "Risk Summary",
        "district": "Khammam",
        "date_range": "Last 90 Days",
        "format": "Excel",
        "date": "2025-05-10",
    },
    # 7 - 12: Crop Health
    {
        "id": 7,
        "title": "Crop Health - All Districts",
        "type": "Crop Health",
        "district": "All Districts",
        "date_range": "Last 30 Days",
        "format": "Excel",
        "date": "2025-05-18",
    },
    {
        "id": 8,
        "title": "Crop Health - Nalgonda",
        "type": "Crop Health",
        "district": "Nalgonda",
        "date_range": "Last 7 Days",
        "format": "PDF",
        "date": "2025-05-16",
    },
    {
        "id": 9,
        "title": "Crop Health - Mahabubnagar",
        "type": "Crop Health",
        "district": "Mahabubnagar",
        "date_range": "Last 30 Days",
        "format": "CSV",
        "date": "2025-05-15",
    },
    {
        "id": 10,
        "title": "Crop Health - Adilabad",
        "type": "Crop Health",
        "district": "Adilabad",
        "date_range": "Last 60 Days",
        "format": "PDF",
        "date": "2025-05-13",
    },
    {
        "id": 11,
        "title": "Crop Health - Mancherial",
        "type": "Crop Health",
        "district": "Mancherial",
        "date_range": "Last 30 Days",
        "format": "Excel",
        "date": "2025-05-11",
    },
    {
        "id": 12,
        "title": "Crop Health - Siddipet",
        "type": "Crop Health",
        "district": "Siddipet",
        "date_range": "Last 90 Days",
        "format": "PDF",
        "date": "2025-05-09",
    },
    # 13 - 18: Yield Forecast (Placeholder content)
    {
        "id": 13,
        "title": "Yield Forecast - All Districts",
        "type": "Yield Forecast",
        "district": "All Districts",
        "date_range": "Last 60 Days",
        "format": "PDF",
        "date": "2025-05-18",
    },
    {
        "id": 14,
        "title": "Yield Forecast - Warangal",
        "type": "Yield Forecast",
        "district": "Warangal",
        "date_range": "Last 30 Days",
        "format": "Excel",
        "date": "2025-05-15",
    },
    {
        "id": 15,
        "title": "Yield Forecast - Nizamabad",
        "type": "Yield Forecast",
        "district": "Nizamabad",
        "date_range": "Last 90 Days",
        "format": "CSV",
        "date": "2025-05-14",
    },
    {
        "id": 16,
        "title": "Yield Forecast - Medak",
        "type": "Yield Forecast",
        "district": "Medak",
        "date_range": "Last 30 Days",
        "format": "PDF",
        "date": "2025-05-12",
    },
    {
        "id": 17,
        "title": "Yield Forecast - Suryapet",
        "type": "Yield Forecast",
        "district": "Suryapet",
        "date_range": "Last 7 Days",
        "format": "Excel",
        "date": "2025-05-10",
    },
    {
        "id": 18,
        "title": "Yield Forecast - Rangareddy",
        "type": "Yield Forecast",
        "district": "Rangareddy",
        "date_range": "Last 30 Days",
        "format": "PDF",
        "date": "2025-05-08",
    },
    # 19 - 24: Intervention Log (Placeholder content)
    {
        "id": 19,
        "title": "Intervention Log - All Districts",
        "type": "Intervention Log",
        "district": "All Districts",
        "date_range": "Last 30 Days",
        "format": "CSV",
        "date": "2025-05-17",
    },
    {
        "id": 20,
        "title": "Intervention Log - Jagtial",
        "type": "Intervention Log",
        "district": "Jagtial",
        "date_range": "Last 7 Days",
        "format": "PDF",
        "date": "2025-05-16",
    },
    {
        "id": 21,
        "title": "Intervention Log - Bhadradri Kothagudem",
        "type": "Intervention Log",
        "district": "Bhadradri Kothagudem",
        "date_range": "Last 30 Days",
        "format": "Excel",
        "date": "2025-05-14",
    },
    {
        "id": 22,
        "title": "Intervention Log - Nagarkurnool",
        "type": "Intervention Log",
        "district": "Nagarkurnool",
        "date_range": "Last 60 Days",
        "format": "PDF",
        "date": "2025-05-12",
    },
    {
        "id": 23,
        "title": "Intervention Log - Wanaparthy",
        "type": "Intervention Log",
        "district": "Wanaparthy",
        "date_range": "Last 30 Days",
        "format": "CSV",
        "date": "2025-05-10",
    },
    {
        "id": 24,
        "title": "Intervention Log - Vikarabad",
        "type": "Intervention Log",
        "district": "Vikarabad",
        "date_range": "Last 90 Days",
        "format": "PDF",
        "date": "2025-05-07",
    },
]


def seed_reports(db: Session) -> None:
    """Seed 24 historical reports with real generated files and file sizes."""
    from app.core.database import Base, engine
    Base.metadata.create_all(bind=engine)

    get_storage_dir()
    existing_count = db.query(Report).count()
    if existing_count >= len(SEEDED_REPORTS_SPECS):
        logger.info(f"Reports already seeded ({existing_count} records). Checking file integrity...")
        # Verify all files exist on disk, regenerate any missing files
        reports = db.query(Report).all()
        for r in reports:
            if not r.file_path or not Path(r.file_path).exists():
                file_info = create_report_file(
                    db=db,
                    report_type=r.type,
                    district=r.district,
                    date_range="Last 30 Days",
                    format_type=r.format,
                    custom_date=r.date_generated,
                )
                r.file_path = file_info["file_path"]
                r.file_size_bytes = file_info["file_size_bytes"]
        db.commit()
        return

    logger.info(f"Seeding {len(SEEDED_REPORTS_SPECS)} historical government reports...")

    for spec in SEEDED_REPORTS_SPECS:
        existing = db.query(Report).filter(Report.id == spec["id"]).first()
        if existing:
            continue

        file_info = create_report_file(
            db=db,
            report_type=spec["type"],
            district=spec["district"],
            date_range=spec["date_range"],
            format_type=spec["format"],
            custom_date=spec["date"],
        )

        report = Report(
            id=spec["id"],
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
        db.add(report)

    db.commit()
    logger.info(f"Successfully seeded {len(SEEDED_REPORTS_SPECS)} government reports.")

