import datetime
from typing import Optional
from pydantic import Field, model_validator

from app.schemas.base import BaseSchema

class ExperienceBase(BaseSchema):
    """Common properties inherited across Experience schemas."""
    company_name: str = Field(..., min_length=1, max_length=150, description="Name of the employing company")
    job_title: str = Field(..., min_length=1, max_length=100, description="Professional designation")
    employment_type: Optional[str] = Field(None, max_length=100, description="Employment type (e.g. Full-time, Part-time)")
    location: Optional[str] = Field(None, max_length=100, description="Work location")
    start_date: datetime.date = Field(..., description="Date employment began")
    end_date: Optional[datetime.date] = Field(None, description="Date employment concluded or null if ongoing")
    currently_working: bool = Field(False, description="True if the candidate currently holds this position")
    description: str = Field(..., description="Details regarding responsibilities and accomplishments in this role")

    @model_validator(mode="after")
    def validate_experience_dates(self) -> "ExperienceBase":
        """Validate start_date, end_date and currently_working toggles."""
        s_date = self.start_date
        e_date = self.end_date
        is_current = self.currently_working

        if is_current:
            if e_date is not None:
                raise ValueError("If Currently Working is true, End Date must be null")
        else:
            if e_date is None:
                raise ValueError("If Currently Working is false, End Date must be specified")

        if s_date and e_date and s_date >= e_date:
            raise ValueError("Start date must be strictly before the end date")
        return self


class ExperienceCreate(ExperienceBase):
    """Schema to validate request payload during professional entry creation."""
    pass


class ExperienceUpdate(ExperienceBase):
    """Schema to validate request payload during professional entry updates."""
    pass


class ExperienceResponse(ExperienceBase):
    """Schema defining professional response payload format."""
    id: int
    resume_id: int
