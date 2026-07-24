import re
import datetime
from typing import Optional
from pydantic import Field, field_validator

from app.schemas.base import BaseSchema

# Phone number regex permitting optional '+', spaces, dashes, and between 7 to 20 digits
PHONE_REGEX = re.compile(r"^\+?[0-9\s\-]{7,20}$")

class ProfileBase(BaseSchema):
    """Common properties inherited across Job Seeker Profile schemas."""
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name of the job seeker")
    phone_number: str = Field(..., description="Phone number format validation")
    date_of_birth: datetime.date = Field(..., description="Date of birth")
    gender: str = Field(..., min_length=1, max_length=20, description="Gender classification")
    address: str = Field(..., min_length=1, max_length=255, description="Street address")
    city: str = Field(..., min_length=1, max_length=100, description="City of residence")
    state: str = Field(..., min_length=1, max_length=100, description="State of residence")
    country: str = Field(..., min_length=1, max_length=100, description="Country of residence")
    linkedin_url: Optional[str] = Field(None, max_length=255, description="LinkedIn profile URL")
    github_url: Optional[str] = Field(None, max_length=255, description="GitHub profile URL")
    portfolio_url: Optional[str] = Field(None, max_length=255, description="Portfolio URL")
    professional_summary: Optional[str] = Field(None, description="Professional summary overview")
    profile_photo_url: Optional[str] = Field(None, max_length=255, description="Profile picture photo URL")

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Verify the phone number format."""
        clean_v = v.strip()
        if not PHONE_REGEX.match(clean_v):
            raise ValueError("Phone number must contain between 7 to 20 digits and can only include '+', '-', or spaces.")
        return clean_v

    @field_validator("linkedin_url", "github_url", "portfolio_url", "profile_photo_url")
    @classmethod
    def validate_url_fields(cls, v: Optional[str]) -> Optional[str]:
        """Verify HTTP/HTTPS protocol urls if provided."""
        if v and v.strip():
            url_str = v.strip()
            if not (url_str.startswith("http://") or url_str.startswith("https://")):
                raise ValueError("Must be a valid HTTP or HTTPS URL")
            return url_str
        return None


class ProfileCreate(ProfileBase):
    """Schema to validate request payload during profile creation."""
    pass


class ProfileUpdate(ProfileBase):
    """Schema to validate request payload during profile updates."""
    pass


class ProfileResponse(ProfileBase):
    """Schema defining profile response payload format."""
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
