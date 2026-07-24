import datetime
from typing import Optional
from pydantic import Field, model_validator

from app.schemas.base import BaseSchema

class EducationBase(BaseSchema):
    """Common properties inherited across Education schemas."""
    institution_name: str = Field(..., min_length=1, max_length=150, description="Name of the school, college, or university")
    degree: str = Field(..., min_length=1, max_length=100, description="Degree or certificate attained")
    field_of_study: str = Field(..., min_length=1, max_length=100, description="Field or major of study")
    start_date: datetime.date = Field(..., description="Date academic studies began")
    end_date: Optional[datetime.date] = Field(None, description="Date studies concluded or null if ongoing")
    grade: Optional[str] = Field(None, max_length=50, description="Academic score, CGPA or grade classification")
    description: Optional[str] = Field(None, description="Description of achievements, activities or coursework")

    @model_validator(mode="after")
    def validate_academic_dates(self) -> "EducationBase":
        """Validate start_date is strictly before end_date."""
        s_date = self.start_date
        e_date = self.end_date
        if s_date and e_date and s_date >= e_date:
            raise ValueError("Start date must be strictly before the end date")
        return self


class EducationCreate(EducationBase):
    """Schema to validate request payload during academic entry creation."""
    pass


class EducationUpdate(EducationBase):
    """Schema to validate request payload during academic entry updates."""
    pass


class EducationResponse(EducationBase):
    """Schema defining academic response payload format."""
    id: int
    resume_id: int
