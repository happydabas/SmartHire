from datetime import datetime
from typing import Optional
from pydantic import Field, field_validator

from app.schemas.base import BaseSchema

class CompanyBase(BaseSchema):
    """Common properties inherited across Company schemas."""
    name: str = Field(..., min_length=1, max_length=100, description="Legal company name")
    website: Optional[str] = Field(None, max_length=255, description="Website URL")
    industry: str = Field(..., min_length=1, max_length=100, description="Company industry sector")
    company_size: str = Field(..., min_length=1, max_length=50, description="Employee size range (e.g. 11-50)")
    location: str = Field(..., min_length=1, max_length=100, description="Primary office location")
    description: Optional[str] = Field(None, description="Detailed company profile description")


class CompanyCreate(CompanyBase):
    """Schema to validate request payload during company creation."""
    
    @field_validator("website")
    @classmethod
    def validate_website_url(cls, v: Optional[str]) -> Optional[str]:
        """Validate website link format if provided."""
        if v and not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("Website must start with 'http://' or 'https://'")
        return v


class CompanyUpdate(BaseSchema):
    """Schema to validate request payload during company profile updates."""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Legal company name")
    website: Optional[str] = Field(None, max_length=255, description="Website URL")
    industry: Optional[str] = Field(None, min_length=1, max_length=100, description="Company industry sector")
    company_size: Optional[str] = Field(None, min_length=1, max_length=50, description="Employee size range")
    location: Optional[str] = Field(None, min_length=1, max_length=100, description="Primary office location")
    description: Optional[str] = Field(None, description="Detailed company profile description")
    logo_url: Optional[str] = Field(None, max_length=255, description="URL pointing to the company logo")

    @field_validator("website")
    @classmethod
    def validate_website_url(cls, v: Optional[str]) -> Optional[str]:
        """Validate website link format if provided."""
        if v and not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("Website must start with 'http://' or 'https://'")
        return v


class CompanyResponse(CompanyBase):
    """Schema defining company response payload format."""
    id: int
    company_code: str = Field(..., description="Unique auto-generated code")
    owner_id: int = Field(..., description="User ID of the company owner")
    logo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
