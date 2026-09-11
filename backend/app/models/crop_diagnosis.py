"""
SQLAlchemy Model for Crop Diagnosis Logs
========================================
Persists image diagnosis results: diagnosed disease/pest/deficiency,
confidence notes, treatment suggestions, language, session ID, and model name.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class CropDiagnosisLog(Base):
    __tablename__ = "crop_diagnosis_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)
    session_id = Column(String(64), nullable=True, index=True)
    question_text = Column(Text, nullable=True)
    image_filename = Column(String(255), nullable=False)
    diagnosis = Column(Text, nullable=False)
    confidence_note = Column(Text, nullable=False)
    suggested_treatment = Column(Text, nullable=False)
    language_used = Column(String(50), nullable=False, index=True)
    disclaimer = Column(Text, nullable=False)
    groq_model_used = Column(String(100), nullable=False)

    def __repr__(self):
        return (
            f"<CropDiagnosisLog(id={self.id}, session='{self.session_id}', "
            f"diagnosis='{self.diagnosis[:30]}...', lang='{self.language_used}', "
            f"model='{self.groq_model_used}')>"
        )
