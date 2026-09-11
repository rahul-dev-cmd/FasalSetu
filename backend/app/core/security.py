"""
Security & Cryptography Utilities
=================================
Provides bcrypt password hashing/verification and JWT token issuance/decoding.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError

from app.core.config import settings


def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt with salt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(
    user_id: int,
    role: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a signed JWT bearer token containing user_id and role.
    Defaults to settings.JWT_EXPIRATION_DAYS if expires_delta is not provided.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta is not None else timedelta(days=settings.JWT_EXPIRATION_DAYS)
    )
    to_encode: Dict[str, Any] = {
        "sub": str(user_id),
        "user_id": user_id,
        "role": role,
        "exp": expire
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT access token.
    Raises JWTError if expired, invalid, or forged.
    """
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
