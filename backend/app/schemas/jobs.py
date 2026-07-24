from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import Field, field_validator, model_validator

from app.schemas.base import BaseSchema
from app.models.jobs import JobType, ExperienceLevel, WorkMode, JobStatus
from app.schemas.companies import CompanyResponse
from app.schemas.users import UserResponse

class JobBase(BaseSchema):
    """Common properties inherited across Job schemas."""
    title: str = Field(..., min_length=1, max_length=100, description="Job title designation")
    description: str = Field(..., min_length=1, description="Detailed job description")
    location: str = Field(..., min_length=1, max_length=100, description="City, State or 'Remote'")
    job_type: JobType = Field(..., description="Employment type (Full-time, Part-time, Internship, etc.)")
    experience_level: ExperienceLevel = Field(..., description="Target candidate experience range")
    work_mode: WorkMode = Field(default=WorkMode.ONSITE, description="Remote, Hybrid, or Onsite classification")
    status: JobStatus = Field(default=JobStatus.DRAFT, description="Publishing status (draft, open, closed)")
    salary_min: Optional[Decimal] = Field(None, ge=0, description="Minimum package range")
    salary_max: Optional[Decimal] = Field(None, ge=0, description="Maximum package range")
    application_deadline: Optional[datetime] = Field(None, description="Expiration date-time for applications")


class JobCreate(JobBase):
    """Schema to validate request payload during job creation."""
    required_skills: List[str] = Field(..., description="List of master skill names required for this job")
    hiring_pipeline: List[str] = Field(
        default=["Applied", "Screening", "Technical Interview", "Hr Interview", "Offer"],
        description="Sequential list of stages for the hiring pipeline"
    )

    @field_validator("application_deadline")
    @classmethod
    def validate_deadline_in_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Verify the deadline is set in the future if present."""
        if v:
            from datetime import timezone
            if v < datetime.now(timezone.utc):
                raise ValueError("Application deadline must be a datetime in the future")
        return v

    @model_validator(mode="after")
    def validate_salary_range(self) -> "JobCreate":
        """Verify salary_max is greater than or equal to salary_min if both are set."""
        s_min = self.salary_min
        s_max = self.salary_max
        if s_min is not None and s_max is not None and s_max < s_min:
            raise ValueError("Maximum salary range cannot be less than the minimum salary")
        return self


class JobUpdate(JobBase):
    """Schema to validate request payload during job updates."""
    required_skills: List[str] = Field(..., description="Updated list of master skill names required for this job")
    hiring_pipeline: List[str] = Field(..., description="Updated stages list for the hiring pipeline")

    @field_validator("application_deadline")
    @classmethod
    def validate_deadline_in_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Verify the deadline is set in the future if present."""
        if v:
            from datetime import timezone
            if v < datetime.now(timezone.utc):
                raise ValueError("Application deadline must be a datetime in the future")
        return v

    @model_validator(mode="after")
    def validate_salary_range(self) -> "JobUpdate":
        """Verify salary_max is greater than or equal to salary_min if both are set."""
        s_min = self.salary_min
        s_max = self.salary_max
        if s_min is not None and s_max is not None and s_max < s_min:
            raise ValueError("Maximum salary range cannot be less than the minimum salary")
        return self


class JobResponse(JobBase):
    """Schema defining job response payload format."""
    id: int
    company_id: int = Field(..., description="ID of the company hosting the job listing")
    recruiter_id: int = Field(..., description="ID of the recruiter who posted the job")
    created_at: datetime
    updated_at: datetime


class SkillResponse(BaseSchema):
    """Schema representing details of a skill."""
    id: int
    skill_name: str
    category: str


class PipelineStageResponse(BaseSchema):
    """Schema representing details of a pipeline stage."""
    id: int
    stage_name: str
    stage_order: int


class PipelineResponse(BaseSchema):
    """Schema representing details of a hiring pipeline."""
    id: int
    stages: List[PipelineStageResponse]


class JobDetailResponse(JobResponse):
    """Detailed Job Response containing company, recruiter, required skills, and pipeline details."""
    company: CompanyResponse
    recruiter: UserResponse
    skills: List[SkillResponse]
    pipeline: Optional[PipelineResponse] = None


class JobPaginatedResponse(BaseSchema):
    """Schema defining paginated job listings response structure."""
    page: int = Field(..., description="Current page index")
    limit: int = Field(..., description="Page size limit")
    total_records: int = Field(..., description="Total matching records count")
    total_pages: int = Field(..., description="Total calculated pages count")
    has_next: bool = Field(..., description="Flag indicating if next page exists")
    has_previous: bool = Field(..., description="Flag indicating if previous page exists")
    jobs: List[JobDetailResponse] = Field(..., description="List of jobs in current page slice")
