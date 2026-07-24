from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.jobs import JobDetailResponse
from app.services.jobs import JobService
from app.auth.dependencies import get_current_active_user

router = APIRouter()

def get_job_service(db: AsyncSession = Depends(get_db)) -> JobService:
    """Dependency provider injecting the JobService."""
    return JobService(db)

@router.get(
    "/jobs",
    response_model=List[JobDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="List all job postings created by caller",
    description="Accessible only by Company Owners and Recruiters. Returns active postings created by the user."
)
async def list_my_jobs(
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> List[JobDetailResponse]:
    """
    Retrieve job postings posted by the logged-in Recruiter/Owner user.
    """
    return await job_service.get_recruiter_jobs(current_user=current_user)
