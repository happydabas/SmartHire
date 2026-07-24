from datetime import datetime
from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema
from app.models.company_invitations import InvitationStatus

class InvitationCreate(BaseSchema):
    """Schema to validate email address during recruiter invitations creation."""
    recruiter_email: EmailStr = Field(..., description="Email address of the recruiter to invite")


class InvitationResponse(BaseSchema):
    """Schema defining invitation response payload format."""
    id: int
    company_id: int = Field(..., description="ID of the company sending the invitation")
    recruiter_email: EmailStr = Field(..., description="Email address invited")
    invitation_token: str = Field(..., description="Unique invitation security verification token")
    status: InvitationStatus = Field(..., description="Status states: pending, accepted, expired")
    expires_at: datetime
    created_at: datetime
    updated_at: datetime
