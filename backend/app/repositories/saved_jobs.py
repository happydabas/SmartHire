from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.saved_jobs import SavedJob
from app.models.jobs import Job

class SavedJobRepository:
    """
    Handles PostgreSQL database operations for the SavedJob model.
    """

    async def get_by_user_and_job(self, db: AsyncSession, user_id: int, job_id: int) -> Optional[SavedJob]:
        """Retrieve a saved job mapping by user ID and job ID."""
        stmt = select(SavedJob).where(
            SavedJob.user_id == user_id,
            SavedJob.job_id == job_id
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_saved_jobs_by_user(self, db: AsyncSession, user_id: int) -> List[Job]:
        """
        Retrieve all Job postings saved by the user.
        Excludes soft-deleted jobs.
        """
        stmt = (
            select(Job)
            .join(SavedJob, Job.id == SavedJob.job_id)
            .where(SavedJob.user_id == user_id, Job.is_deleted == False)
            .order_by(SavedJob.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, *, user_id: int, job_id: int) -> SavedJob:
        """Create a new saved job record."""
        db_obj = SavedJob(user_id=user_id, job_id=job_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, db_obj: SavedJob) -> None:
        """Remove a saved job record."""
        await db.delete(db_obj)
        await db.commit()
