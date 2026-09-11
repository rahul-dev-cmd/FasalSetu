"""
Authentication API Router
=========================
Endpoints for farmer & buyer registration (signup), login, and profile inspection.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    AuthTokenResponse
)
from app.api.deps import get_current_user

logger = logging.getLogger("fasalsetu.auth")

router = APIRouter(prefix="/auth")


@router.post(
    "/signup",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description=(
        "Registers a new farmer or buyer account using phone number and password. "
        "Allows the same phone number to hold both a farmer and a buyer account. "
        "Returns a signed JWT bearer access token."
    )
)
def signup(
    payload: UserSignupRequest,
    db: Session = Depends(get_db)
):
    """Registers a new farmer or buyer account."""
    # Check for existing account with same (phone, role)
    existing_user = db.query(User).filter(
        User.phone == payload.phone,
        User.role == payload.role
    ).first()

    if existing_user:
        logger.warning(f"Signup conflict: phone='{payload.phone}' already registered as '{payload.role}'")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with phone '{payload.phone}' already exists for role '{payload.role}'."
        )

    # Hash password with bcrypt
    hashed = hash_password(payload.password)

    user = User(
        phone=payload.phone,
        password_hash=hashed,
        role=payload.role,
        name=payload.name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(f"New user registered: id={user.id}, phone='{user.phone}', role='{user.role}'")

    token = create_access_token(user_id=user.id, role=user.role)

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain access token",
    description=(
        "Authenticates a user via phone, password, and target role. "
        "Returns 401 with a generic error if credentials or role do not match, "
        "preventing phone number enumeration."
    )
)
def login(
    payload: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticates a user and issues a JWT token."""
    user = db.query(User).filter(
        User.phone == payload.phone,
        User.role == payload.role
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        logger.warning(f"Failed login attempt for phone='{payload.phone}', role='{payload.role}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone, password, or role",
            headers={"WWW-Authenticate": "Bearer"}
        )

    logger.info(f"User logged in successfully: id={user.id}, role='{user.role}'")

    token = create_access_token(user_id=user.id, role=user.role)

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
    description="Returns the profile details of the user associated with the provided JWT bearer token."
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Returns profile information for the authenticated caller."""
    return UserResponse.model_validate(current_user)
