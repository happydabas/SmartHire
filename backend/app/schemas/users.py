import re
from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field, field_validator

from app.schemas.base import BaseSchema
from app.models.users import UserRole, UserStatus

# Define regex pattern for password strength validation
# At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
)

class UserBase(BaseSchema):
    """Common properties inherited across User schemas."""
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the user")
    email: EmailStr = Field(..., description="Unique email address")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number with country prefix")
    profile_image: Optional[str] = Field(None, max_length=255, description="URL to the user profile image")


class UserCreate(UserBase):
    """Schema to validate request payload during registration."""
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    role: UserRole = Field(default=UserRole.JOBSEEKER, description="Account role")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Enforce password strength:
        - At least 8 characters.
        - At least one uppercase letter.
        - At least one lowercase letter.
        - At least one number.
        - At least one special character from (@$!%*?&).
        """
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must be at least 8 characters long and contain "
                "at least one uppercase letter, one lowercase letter, "
                "one number, and one special character (@$!%*?&)."
            )
        return v

    @field_validator("role")
    @classmethod
    def restrict_public_registration_roles(cls, v: UserRole) -> UserRole:
        """
        Verify that only jobseeker and recruiter roles are registerable.
        Admin and company owner accounts cannot be publicly registered.
        """
        allowed_roles = {UserRole.JOBSEEKER, UserRole.RECRUITER}
        if v not in allowed_roles:
            raise ValueError(
                "Public registration is only permitted for Job Seekers (jobseeker) "
                "and Recruiters (recruiter). Admin accounts are restricted."
            )
        return v


class UserResponse(UserBase):
    """Schema defining response format (excludes password)."""
    id: int
    role: UserRole
    status: UserStatus
    company_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class UserStatusUpdate(BaseSchema):
    """Schema to validate recruiter status updates."""
    status: UserStatus = Field(..., description="Active status parameter (ACTIVE or INACTIVE)")
