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

    @field_validator("job_type", mode="before")
    @classmethod
    def normalize_job_type(cls, v):
        """Accept human-readable frontend values like 'Full-time' and map to DB enum values."""
        if isinstance(v, JobType):
            return v
        mapping = {
            "full-time": JobType.FULL_TIME, "full_time": JobType.FULL_TIME, "fulltime": JobType.FULL_TIME,
            "part-time": JobType.PART_TIME, "part_time": JobType.PART_TIME, "parttime": JobType.PART_TIME,
            "contract": JobType.CONTRACT,
            "internship": JobType.INTERNSHIP,
        }
        if isinstance(v, str):
            result = mapping.get(v.strip().lower())
            if result:
                return result
            # Try direct enum lookup
            try:
                return JobType(v)
            except ValueError:
                pass
        raise ValueError(f"Invalid job_type: {v}. Expected one of: Full-time, Part-time, Contract, Internship")

    @field_validator("experience_level", mode="before")
    @classmethod
    def normalize_experience_level(cls, v):
        """Accept human-readable frontend values like 'Entry' and map to DB enum values."""
        if isinstance(v, ExperienceLevel):
            return v
        mapping = {
            "fresher": ExperienceLevel.FRESHER,
            "entry": ExperienceLevel.ENTRY, "junior": ExperienceLevel.ENTRY,
            "mid": ExperienceLevel.MID, "mid-level": ExperienceLevel.MID, "mid_level": ExperienceLevel.MID,
            "senior": ExperienceLevel.SENIOR,
        }
        if isinstance(v, str):
            result = mapping.get(v.strip().lower())
            if result:
                return result
            try:
                return ExperienceLevel(v)
            except ValueError:
                pass
        raise ValueError(f"Invalid experience_level: {v}. Expected one of: Fresher, Entry, Mid, Senior")

    @field_validator("work_mode", mode="before")
    @classmethod
    def normalize_work_mode(cls, v):
        """Accept human-readable frontend values like 'Remote' and map to DB enum values."""
        if isinstance(v, WorkMode):
            return v
        mapping = {
            "remote": WorkMode.REMOTE,
            "hybrid": WorkMode.HYBRID,
            "onsite": WorkMode.ONSITE, "on-site": WorkMode.ONSITE,
        }
        if isinstance(v, str):
            result = mapping.get(v.strip().lower())
            if result:
                return result
            try:
                return WorkMode(v)
            except ValueError:
                pass
        raise ValueError(f"Invalid work_mode: {v}. Expected one of: Remote, Hybrid, Onsite")

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        """Accept human-readable frontend values like 'open' and map to DB enum values."""
        if isinstance(v, JobStatus):
            return v
        mapping = {
            "draft": JobStatus.DRAFT,
            "open": JobStatus.OPEN,
            "closed": JobStatus.CLOSED,
        }
        if isinstance(v, str):
            result = mapping.get(v.strip().lower())
            if result:
                return result
            try:
                return JobStatus(v)
            except ValueError:
                pass
        raise ValueError(f"Invalid status: {v}. Expected one of: draft, open, closed")


class JobCreate(JobBase):
    """Schema to validate request payload during job creation."""
    required_skills: List[str] = Field(..., description="List of master skill names required for this job")
    hiring_pipeline: List[str] = Field(
        default=["Applied", "Screening", "Technical Interview", "Hr Interview", "Offer"],
        description="Sequential list of stages for the hiring pipeline"
    )
    recruiter_ids: Optional[List[int]] = Field(default_factory=list, description="IDs of recruiters assigned to manage this job")

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
    recruiter_ids: Optional[List[int]] = Field(None, description="Updated IDs of recruiters assigned to manage this job")

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


class JobAssignmentsUpdate(BaseSchema):
    """Schema for updating recruiter assignments on a job."""
    recruiter_ids: List[int] = Field(..., description="List of recruiter IDs assigned to this job")


class JobResponse(JobBase):
    """Schema defining job response payload format."""
    id: int
    company_id: int = Field(..., description="ID of the company hosting the job listing")
    recruiter_id: int = Field(..., description="ID of the recruiter who posted the job")
    assigned_recruiter_ids: List[int] = Field(default_factory=list, description="List of IDs of recruiters assigned to this job")
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
    assigned_recruiters: List[UserResponse] = Field(default_factory=list)


class JobPaginatedResponse(BaseSchema):
    """Schema defining paginated job listings response structure."""
    page: int = Field(..., description="Current page index")
    limit: int = Field(..., description="Page size limit")
    total_records: int = Field(..., description="Total matching records count")
    total_pages: int = Field(..., description="Total calculated pages count")
    has_next: bool = Field(..., description="Flag indicating if next page exists")
    has_previous: bool = Field(..., description="Flag indicating if previous page exists")
    jobs: List[JobDetailResponse] = Field(..., description="List of jobs in current page slice")
