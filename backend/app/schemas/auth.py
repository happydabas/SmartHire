from pydantic import BaseModel, EmailStr, Field

from app.schemas.users import UserResponse

class LoginRequest(BaseModel):
    """Pydantic model representing credentials payload during login."""
    email: EmailStr = Field(..., description="Account registered email address")
    password: str = Field(..., description="Account raw password string")


class TokenResponse(BaseModel):
    """Pydantic model returning signed auth session keys and basic user info."""
    access_token: str = Field(..., description="Access authentication token")
    refresh_token: str = Field(..., description="Refresh authentication token")
    token_type: str = Field("bearer", description="Token transfer schema (Bearer)")
    user: UserResponse = Field(..., description="Basic information of the authenticated user")


class RefreshRequest(BaseModel):
    """Payload to request a new access token using a refresh token."""
    refresh_token: str = Field(..., description="Refresh authentication token")


class RefreshResponse(BaseModel):
    """Response containing the newly generated access token."""
    access_token: str = Field(..., description="Newly generated access authentication token")
    token_type: str = Field("bearer", description="Token transfer schema")
