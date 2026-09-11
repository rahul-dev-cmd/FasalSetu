"""
Pydantic Schemas for Feature 8: Answer Feedback Loop
===================================================
Defines request and response models for submitting thumbs up/down ratings
and comments on logged AI responses (Farmer Q&A and Crop Diagnosis).
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class FeedbackSubmitRequest(BaseModel):
    log_type: Literal["qa", "diagnosis"] = Field(
        ...,
        description="Type of log entry: 'qa' for Farmer Q&A, 'diagnosis' for Crop Diagnosis",
        examples=["qa", "diagnosis"]
    )
    log_id: int = Field(
        ...,
        ge=1,
        description="Database primary key ID of the corresponding log row",
        examples=[42]
    )
    rating: Literal["up", "down"] = Field(
        ...,
        description="Feedback rating: 'up' (thumbs up / helpful) or 'down' (thumbs down / unhelpful)",
        examples=["up", "down"]
    )
    comment: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional feedback comment (maximum 500 characters)",
        examples=["Very clear and accurate treatment advice."]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "log_type": "qa",
                "log_id": 42,
                "rating": "up",
                "comment": "Very clear and accurate treatment advice."
            }
        }
    }


class FeedbackResponse(BaseModel):
    log_type: str = Field(..., description="Type of log entry: 'qa' or 'diagnosis'")
    log_id: int = Field(..., description="ID of the rated log entry")
    rating: str = Field(..., description="Current rating: 'up' or 'down'")
    comment: Optional[str] = Field(None, description="Optional feedback comment")
    submitted_at: datetime = Field(..., description="Timestamp when feedback was submitted or updated")

    model_config = {
        "json_schema_extra": {
            "example": {
                "log_type": "qa",
                "log_id": 42,
                "rating": "up",
                "comment": "Very clear and accurate treatment advice.",
                "submitted_at": "2026-09-12T10:00:00Z"
            }
        }
    }
