"""
Authentication & Authorization Dependencies
===========================================
FastAPI dependencies for extracting and verifying JWT bearer tokens,
loading the authenticated User, and enforcing role-based permissions.
"""

from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.crop_listing import CropListing, CropOffer

oauth2_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts and validates the JWT bearer token from Authorization header.
    Returns the authenticated User model instance or raises 401 Unauthorized.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("sub") or payload.get("user_id")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"}
            )
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


def require_role(required_role: str) -> Callable:
    """
    Dependency factory that restricts an endpoint to users with a specific role ('farmer', 'buyer', or 'government').
    Raises 403 Forbidden if the authenticated user's role does not match.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Action requires '{required_role}' role (current role: '{current_user.role}')."
            )
        return current_user

    return role_checker


def verify_negotiation_party(listing: CropListing, current_user: User, db: Session) -> None:
    """
    Verifies that current_user is an authorized party in the listing's negotiation thread:
    - If farmer: must be the owner of the listing (listing.farmer_id == current_user.id).
    - If buyer: must have at least one offer on this listing.
    Raises 403 Forbidden if the user is not a party.
    """
    if current_user.role == "farmer":
        if int(listing.farmer_id) != int(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this listing and cannot access this negotiation thread."
            )
        return

    if current_user.role == "buyer":
        has_offer = db.query(CropOffer).filter(
            CropOffer.listing_id == listing.id,
            CropOffer.buyer_id == current_user.id
        ).first()
        if not has_offer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have an active offer or thread on this listing."
            )
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: You are not an authorized party to this negotiation."
    )
