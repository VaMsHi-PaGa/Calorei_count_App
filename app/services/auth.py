"""
Authentication service for JWT token management and password hashing.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
import secrets

import bcrypt
from jose import JWTError, jwt

# Configuration from environment
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "43200"))  # 30 days


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        # Hash is invalid or corrupted
        return False


def create_access_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": str(user_id), "type": "access", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token."""
    if expires_delta is None:
        expires_delta = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": str(user_id), "type": "refresh", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[int]:
    """
    Verify a JWT token and return the user_id if valid.

    Args:
        token: JWT token string
        token_type: "access" or "refresh"

    Returns:
        user_id if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_t: str = payload.get("type")

        if user_id is None or token_t != token_type:
            return None

        return int(user_id)
    except (JWTError, ValueError):
        return None


def generate_reset_token(length: int = 32) -> str:
    """Generate a secure random token for password reset."""
    return secrets.token_urlsafe(length)


def get_token_expiry(token: str) -> Optional[datetime]:
    """Get expiry time of a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        if exp:
            return datetime.utcfromtimestamp(exp)
        return None
    except (JWTError, ValueError):
        return None
