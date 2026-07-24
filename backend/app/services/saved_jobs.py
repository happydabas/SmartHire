from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.saved_jobs import SavedJobRepository
from app.repositories.jobs import JobRepository
from app.models.saved_jobs import SavedJob
from app.models.jobs import Job, JobStatus
from app.models.users import User, UserRole

class SavedJobService:
    """
    Handles business logic for saving and unsaving jobs.
    Enforces authorization, open-status validations, and uniqueness.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.saved_job_repo = SavedJobRepository()
        self.job_repo = JobRepository()

    async def save_job(self, job_id: int, current_user: User) -> SavedJob:
        """
        Save a job posting for the logged-in job seeker.
        """
        # 1. Enforce Role constraint
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to save jobs."
            )

        # 2. Check if the job exists
        job = await self.job_repo.get_by_id(self.db, job_id=job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found."
            )

        # 3. Enforce only OPEN and active jobs can be saved (no DRAFT, CLOSED, or deleted jobs)
        if job.status != JobStatus.OPEN or job.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only open and active jobs can be saved."
            )

        # 4. Prevent duplicate saves
        existing = await self.saved_job_repo.get_by_user_and_job(
            self.db, user_id=current_user.id, job_id=job_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already saved this job."
            )

        # 5. Create saved job record
        return await self.saved_job_repo.create(self.db, user_id=current_user.id, job_id=job_id)

    async def get_saved_jobs(self, current_user: User) -> List[Job]:
        """
        Retrieve all jobs saved by the logged-in job seeker.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to retrieve saved jobs."
            )

        return await self.saved_job_repo.get_saved_jobs_by_user(self.db, user_id=current_user.id)

    async def unsave_job(self, job_id: int, current_user: User) -> None:
        """
        Remove a saved job from the logged-in job seeker's list.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to unsave jobs."
            )

        association = await self.saved_job_repo.get_by_user_and_job(
            self.db, user_id=current_user.id, job_id=job_id
        )
        if not association:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Saved job mapping not found for this profile."
            )

        await self.saved_job_repo.delete(self.db, db_obj=association)
