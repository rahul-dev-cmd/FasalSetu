"""
Pydantic Schemas for Feature 9: Authentication & Authorization
=============================================================
Defines request and response validation contracts for signup, login,
and authenticated user representations.
"""

import re
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator


INDIAN_PHONE_REGEX = re.compile(r"^[6-9]\d{9}$")


class UserSignupRequest(BaseModel):
    phone: str = Field(
        ...,
        description="10-digit Indian mobile number (e.g. 9876543210)",
        examples=["9876543210"]
    )
    password: str = Field(
        ...,
        min_length=8,
        description="User password (minimum 8 characters)",
        examples=["SecretFarmer123!"]
    )
    role: Literal["farmer", "buyer", "government"] = Field(
        ...,
        description="User role: 'farmer', 'buyer', or 'government'",
        examples=["farmer", "buyer", "government"]
    )
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional full name or farm/business name",
        examples=["Ramesh Patel"]
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip().replace(" ", "").replace("-", "")
        # Remove leading +91 or 0 if present
        if cleaned.startswith("+91"):
            cleaned = cleaned[3:]
        elif cleaned.startswith("0") and len(cleaned) == 11:
            cleaned = cleaned[1:]

        if not INDIAN_PHONE_REGEX.match(cleaned):
            raise ValueError(
                "Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
            )
        return cleaned


class UserLoginRequest(BaseModel):
    phone: str = Field(
        ...,
        description="10-digit Indian mobile number (e.g. 9876543210)",
        examples=["9876543210"]
    )
    password: str = Field(
        ...,
        min_length=1,
        description="User password",
        examples=["SecretFarmer123!"]
    )
    role: Literal["farmer", "buyer", "government"] = Field(
        ...,
        description="Target role for authentication: 'farmer', 'buyer', or 'government'",
        examples=["farmer", "buyer", "government"]
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip().replace(" ", "").replace("-", "")
        if cleaned.startswith("+91"):
            cleaned = cleaned[3:]
        elif cleaned.startswith("0") and len(cleaned) == 11:
            cleaned = cleaned[1:]

        if not INDIAN_PHONE_REGEX.match(cleaned):
            raise ValueError(
                "Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
            )
        return cleaned


class UserResponse(BaseModel):
    id: int = Field(..., description="Unique database user ID")
    phone: str = Field(..., description="User mobile number")
    role: str = Field(..., description="User role ('farmer' or 'buyer')")
    name: Optional[str] = Field(None, description="User name")
    created_at: datetime = Field(..., description="Account registration timestamp")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "phone": "9876543210",
                "role": "farmer",
                "name": "Ramesh Patel",
                "created_at": "2026-09-12T03:00:00Z"
            }
        }
    }


class AuthTokenResponse(BaseModel):
    access_token: str = Field(..., description="Signed JWT bearer access token")
    token_type: str = Field("bearer", description="Token type, always 'bearer'")
    user: UserResponse = Field(..., description="Authenticated user account details")

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "phone": "9876543210",
                    "role": "farmer",
                    "name": "Ramesh Patel",
                    "created_at": "2026-09-12T03:00:00Z"
                }
            }
        }
    }
