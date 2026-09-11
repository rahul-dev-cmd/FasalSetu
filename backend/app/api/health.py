"""
Health Check API Route
======================
Provides GET /api/health endpoint for service availability and connectivity verification.
"""

from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Backend health check")
async def health_check() -> HealthResponse:
    """Returns status ok to verify the backend server is reachable by the frontend."""
    return HealthResponse(status="ok")
