from datetime import datetime
from typing import Optional
from pydantic import Field

from app.schemas.base import BaseSchema
from app.schemas.profiles import ProfileResponse
from app.models.applications import ApplicationStatus

class ApplicationCreate(BaseSchema):
    """Schema to validate request payload during application creation."""
    job_id: int = Field(..., description="ID of the job posting being applied to")


class ApplicationStatusUpdate(BaseSchema):
    """Schema to validate request payload during application status update."""
    status: ApplicationStatus


class ApplicationResponse(BaseSchema):
    """Schema representing application response details."""
    id: int
    job_id: int
    user_id: int
    status: ApplicationStatus
    applied_at: datetime


class JobBriefResponse(BaseSchema):
    """Schema representing basic job details for application mapping."""
    id: int
    title: str = Field(..., alias="job_title")
    description: str = Field(..., alias="job_description")
    company_name: str
    location: str
    job_type: str

    class Config:
        populate_by_name = True


class CandidateBriefResponse(BaseSchema):
    """Schema representing candidate details for application mapping."""
    id: int
    name: str = Field(..., alias="candidate_name")
    profile: Optional[ProfileResponse] = None

    class Config:
        populate_by_name = True


class ResumeBriefResponse(BaseSchema):
    """Schema representing resume details for application mapping."""
    id: int
    file_name: Optional[str] = Field(None, alias="resume_file_name")
    file_path: Optional[str] = Field(None, alias="resume_url_or_path")

    class Config:
        populate_by_name = True


class ApplicationDetailResponse(BaseSchema):
    """Schema representing complete application details."""
    id: int = Field(..., alias="application_id")
    status: ApplicationStatus
    applied_at: datetime
    created_at: datetime
    updated_at: datetime
    job: JobBriefResponse
    candidate: CandidateBriefResponse
    resume: Optional[ResumeBriefResponse] = None

    class Config:
        populate_by_name = True


class JobHistoryBriefResponse(BaseSchema):
    """Schema representing basic job details in user application history."""
    title: str
    company: str = Field(..., alias="company_name")
    location: str

    class Config:
        populate_by_name = True


class ApplicationHistoryItem(BaseSchema):
    """Schema representing an item in the user's application history."""
    id: int = Field(..., alias="application_id")
    status: ApplicationStatus
    applied_at: datetime
    updated_at: datetime
    job: JobHistoryBriefResponse

    class Config:
        populate_by_name = True


class ApplicationHistoryResponse(BaseSchema):
    """Schema representing paginated list of user's application history."""
    page: int
    limit: int
    total: int
    items: list[ApplicationHistoryItem]

    class Config:
        populate_by_name = True


class ApplicationWithdrawResponse(BaseSchema):
    """Schema representing withdrawal success response."""
    message: str
    application_id: int
    status: ApplicationStatus

    class Config:
        populate_by_name = True


class RecruiterJobBriefResponse(BaseSchema):
    """Schema representing basic job details in recruiter view."""
    id: int = Field(..., alias="job_id")
    title: str = Field(..., alias="job_title")

    class Config:
        populate_by_name = True


class RecruiterCandidateBriefResponse(BaseSchema):
    """Schema representing basic candidate details in recruiter view."""
    id: int = Field(..., alias="user_id")
    name: str = Field(..., alias="full_name")
    email: str
    profile: Optional[ProfileResponse] = None

    class Config:
        populate_by_name = True


class RecruiterResumeBriefResponse(BaseSchema):
    """Schema representing basic resume details in recruiter view."""
    id: int = Field(..., alias="resume_id")
    file_name: Optional[str] = Field(None, alias="resume_file_name")
    file_path: Optional[str] = Field(None, alias="resume_url_or_path")

    class Config:
        populate_by_name = True


class RecruiterApplicationItem(BaseSchema):
    """Schema representing a single job application item in recruiter view."""
    id: int = Field(..., alias="application_id")
    status: ApplicationStatus
    applied_at: datetime
    created_at: datetime
    candidate: RecruiterCandidateBriefResponse
    resume: Optional[RecruiterResumeBriefResponse] = None
    job: RecruiterJobBriefResponse

    class Config:
        populate_by_name = True


class RecruiterApplicationsResponse(BaseSchema):
    """Schema representing paginated list of job applications in recruiter view."""
    total: int
    page: int
    limit: int
    items: list[RecruiterApplicationItem]

    class Config:
        populate_by_name = True
