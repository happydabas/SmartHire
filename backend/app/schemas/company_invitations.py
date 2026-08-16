from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema
from app.models.company_invitations import InvitationStatus

class InvitationCreate(BaseSchema):
    """Schema to validate email address during recruiter invitations creation."""
    recruiter_email: EmailStr = Field(..., description="Email address of the recruiter to invite")
    frontend_url: Optional[str] = Field(None, description="Current client frontend origin (e.g. window.location.origin)")


class InvitationResponse(BaseSchema):
    """Schema defining invitation response payload format."""
    id: int
    company_id: int = Field(..., description="ID of the company sending the invitation")
    recruiter_email: EmailStr = Field(..., description="Email address invited")
    invitation_token: str = Field(..., description="Unique invitation security verification token")
    status: InvitationStatus = Field(..., description="Status states: pending, accepted, expired, cancelled")
    expires_at: datetime
    created_at: datetime
    updated_at: datetime


class InvitationDetailResponse(BaseSchema):
    """Schema returning public details of an invitation token."""
    invitation_token: str
    recruiter_email: str
    company_id: int
    company_name: str
    status: InvitationStatus
    expires_at: datetime
    is_expired: bool
    existing_user: bool


class InvitationAcceptRequest(BaseSchema):
    """Schema for submitting invitation acceptance."""
    token: str = Field(..., description="Invitation token string")
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Full name if creating new account")
    password: Optional[str] = Field(None, min_length=8, max_length=128, description="Password for account creation or verification")

