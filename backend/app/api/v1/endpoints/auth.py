from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.users import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, RefreshResponse
from app.services.users import UserService
from app.services.auth import AuthService
from app.auth.dependencies import get_current_active_user, verify_refresh_token
from app.auth.jwt import create_access_token

router = APIRouter()

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    """Dependency provider injecting the UserService."""
    return UserService(db)

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency provider injecting the AuthService."""
    return AuthService(db)

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new public user",
    description="Allows Job Seekers and Recruiters to register a new account. Admin registrations are restricted."
)
async def register(
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service)
) -> UserResponse:
    """
    Register a new user.
    """
    created_user = await user_service.register_user(user_in)
    return created_user

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate credentials and retrieve session tokens",
    description="Allows users to log in with email and password, obtaining access and refresh tokens."
)
async def login(
    credentials: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> TokenResponse:
    """
    Verify user credentials and return authentication JWTs.
    """
    tokens = await auth_service.authenticate(credentials)
    return tokens

@router.post(
    "/refresh",
    response_model=RefreshResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtain a new access token",
    description="Accepts a refresh token in the body, verifies it, and returns a new access token."
)
async def refresh_access_token(
    payload: RefreshRequest
) -> RefreshResponse:
    """
    Validate refresh token and issue a new short-lived access token.
    """
    # 1. Verify and decode the refresh token (raises 401 on failure/expiry)
    token_claims = verify_refresh_token(payload.refresh_token)
    
    # 2. Extract subject and extra claims to create a new access token
    new_access = create_access_token(
        subject=token_claims.get("sub"),
        email=token_claims.get("email"),
        role=token_claims.get("role")
    )
    
    return RefreshResponse(access_token=new_access)

@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the profile details of the authenticated requester user."
)
async def get_me(
    current_user: User = Depends(get_current_active_user)
) -> UserResponse:
    """
    Fetch and return the active authenticated user profile.
    """
    return current_user
