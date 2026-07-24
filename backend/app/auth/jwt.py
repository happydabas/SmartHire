from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Union
import jwt

from app.core.config import settings

def create_access_token(
    subject: Union[str, Any], 
    email: str, 
    role: str, 
    expires_delta: timedelta = None
) -> str:
    """
    Generate a signed JWT Access Token.
    - subject: Identifies the owner of the token (typically user ID).
    - email: Included in the payload claims.
    - role: Included in the payload claims for frontend/api authorization.
    - expires_delta: Optional custom expiry duration.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "user_id": int(subject),
        "email": email,
        "role": role,
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, Any], 
    email: str, 
    role: str, 
    expires_delta: timedelta = None
) -> str:
    """
    Generate a signed JWT Refresh Token.
    - subject: Identifies the owner of the token.
    - email: Included in the payload claims.
    - role: Included in the payload claims.
    - expires_delta: Optional custom expiry duration.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "user_id": int(subject),
        "email": email,
        "role": role,
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_REFRESH_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT Access Token.
    Returns the token payload dictionary if valid.
    """
    payload = jwt.decode(
        token, 
        settings.JWT_SECRET_KEY, 
        algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Token type must be 'access'")
    return payload

def decode_refresh_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT Refresh Token.
    Returns the token payload dictionary if valid.
    """
    payload = jwt.decode(
        token, 
        settings.JWT_REFRESH_SECRET_KEY, 
        algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != "refresh":
        raise jwt.InvalidTokenError("Token type must be 'refresh'")
    return payload
