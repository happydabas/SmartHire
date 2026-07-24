from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.jobs import JobDetailResponse
from app.schemas.saved_jobs import SavedJobResponse
from app.services.saved_jobs import SavedJobService
from app.auth.dependencies import get_current_active_user

router = APIRouter()

def get_saved_job_service(db: AsyncSession = Depends(get_db)) -> SavedJobService:
    """Dependency provider injecting the SavedJobService."""
    return SavedJobService(db)


@router.post(
    "/{job_id}",
    response_model=SavedJobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a job posting",
    description="Accessible only by authenticated Job Seekers. Saves a job posting."
)
async def save_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    service: SavedJobService = Depends(get_saved_job_service)
) -> SavedJobResponse:
    """
    Save a job posting for the logged-in user.
    """
    return await service.save_job(job_id=job_id, current_user=current_user)


@router.get(
    "",
    response_model=List[JobDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get saved jobs list",
    description="Accessible only by authenticated Job Seekers. Returns all saved jobs for the user."
)
async def get_saved_jobs(
    current_user: User = Depends(get_current_active_user),
    service: SavedJobService = Depends(get_saved_job_service)
) -> List[JobDetailResponse]:
    """
    Retrieve all saved jobs for the logged-in user.
    """
    return await service.get_saved_jobs(current_user=current_user)


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unsave a job posting",
    description="Accessible only by authenticated Job Seekers. Removes a saved job."
)
async def unsave_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    service: SavedJobService = Depends(get_saved_job_service)
):
    """
    Remove a saved job from the logged-in user's list.
    """
    await service.unsave_job(job_id=job_id, current_user=current_user)
