from typing import List
from fastapi import Depends, HTTPException, status
import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.auth.security import oauth2_scheme
from app.auth.jwt import decode_access_token, decode_refresh_token
from app.repositories.users import UserRepository
from app.models.users import User, UserRole

user_repo = UserRepository()

def verify_access_token(token: str) -> dict:
    """
    Decodes and validates a JWT Access Token.
    """
    try:
        return decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_refresh_token(token: str) -> dict:
    """
    Decodes and validates a JWT Refresh Token.
    """
    try:
        return decode_refresh_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    """
    Retrieves the user ID integer from the token subject payload.
    Does NOT execute database queries.
    """
    payload = verify_access_token(token)
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Asynchronously queries PostgreSQL to load the full User record matching
    the validated user ID payload.
    """
    user_id = get_current_user_id(token)
    
    user = await user_repo.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Checks active flags. Passthrough for current user structure.
    """
    return current_user


class RoleChecker:
    """
    FastAPI dependency factory class to authorize user requests
    based on their assigned role in the database.
    """
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )
        return current_user


# Reusable dependencies for specific roles
require_job_seeker = RoleChecker([UserRole.JOBSEEKER])
require_recruiter = RoleChecker([UserRole.RECRUITER])
require_company_owner = RoleChecker([UserRole.COMPANY_OWNER])
require_admin = RoleChecker([UserRole.ADMIN])

def require_roles(allowed_roles: List[UserRole]) -> RoleChecker:
    """
    Returns a RoleChecker dependency targeting multiple allowed roles.
    """
    return RoleChecker(allowed_roles)
