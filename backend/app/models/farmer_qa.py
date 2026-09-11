"""
SQLAlchemy Model for Farmer Q&A Logs
====================================
Logs each farmer query, detected/provided language, assistant response,
off-topic classification flag, and the Groq model used.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class FarmerQALog(Base):
    __tablename__ = "farmer_qa_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    language_used = Column(String(50), nullable=False, index=True)
    response_text = Column(Text, nullable=False)
    was_flagged_offtopic = Column(Boolean, default=False, nullable=False, index=True)
    groq_model_used = Column(String(100), nullable=False)
    was_voice_input = Column(Boolean, default=False, nullable=False, index=True)

    def __repr__(self):
        return (
            f"<FarmerQALog(id={self.id}, lang='{self.language_used}', "
            f"voice={self.was_voice_input}, offtopic={self.was_flagged_offtopic}, "
            f"model='{self.groq_model_used}')>"
        )
