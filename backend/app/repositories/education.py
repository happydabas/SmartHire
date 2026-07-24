from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.education import Education
from app.schemas.education import EducationCreate, EducationUpdate

class EducationRepository:
    """
    Handles all direct PostgreSQL transactions for the Education model
    using SQLAlchemy 2.0 AsyncSession.
    """

    async def get_by_id(self, db: AsyncSession, education_id: int) -> Optional[Education]:
        """
        Retrieve an academic record by primary key ID.
        """
        stmt = select(Education).where(Education.id == education_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_resume_id_sorted(self, db: AsyncSession, resume_id: int) -> List[Education]:
        """
        Retrieve all education records linked to the resume, sorted by start_date descending.
        """
        stmt = (
            select(Education)
            .where(Education.resume_id == resume_id)
            .order_by(Education.start_date.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: EducationCreate,
        resume_id: int
    ) -> Education:
        """
        Insert and persist a new education record.
        """
        db_obj = Education(
            resume_id=resume_id,
            institution_name=obj_in.institution_name,
            degree=obj_in.degree,
            field_of_study=obj_in.field_of_study,
            start_date=obj_in.start_date,
            end_date=obj_in.end_date,
            grade=obj_in.grade,
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
        db_obj: Education,
        obj_in: EducationUpdate
    ) -> Education:
        """
        Update the fields of an existing education record.
        """
        update_data = obj_in.model_dump()
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, db_obj: Education) -> None:
        """
        Permanently delete an education record.
        """
        await db.delete(db_obj)
        await db.commit()
