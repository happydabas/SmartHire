from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.experience import Experience
from app.schemas.experience import ExperienceCreate, ExperienceUpdate

class ExperienceRepository:
    """
    Handles all direct PostgreSQL transactions for the Experience model
    using SQLAlchemy 2.0 AsyncSession.
    """

    async def get_by_id(self, db: AsyncSession, experience_id: int) -> Optional[Experience]:
        """
        Retrieve an experience record by primary key ID.
        """
        stmt = select(Experience).where(Experience.id == experience_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_resume_id_sorted(self, db: AsyncSession, resume_id: int) -> List[Experience]:
        """
        Retrieve all experience records linked to the resume, sorted by start_date descending.
        """
        stmt = (
            select(Experience)
            .where(Experience.resume_id == resume_id)
            .order_by(Experience.start_date.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: ExperienceCreate,
        resume_id: int
    ) -> Experience:
        """
        Insert and persist a new experience record.
        """
        db_obj = Experience(
            resume_id=resume_id,
            company_name=obj_in.company_name,
            job_title=obj_in.job_title,
            employment_type=obj_in.employment_type,
            location=obj_in.location,
            start_date=obj_in.start_date,
            end_date=obj_in.end_date,
            currently_working=obj_in.currently_working,
            description=obj_in.description
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: Experience,
        obj_in: ExperienceUpdate
    ) -> Experience:
        """
        Update the fields of an existing experience record.
        """
        update_data = obj_in.model_dump()
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, db_obj: Experience) -> None:
        """
        Permanently delete an experience record.
        """
        await db.delete(db_obj)
        await db.commit()
