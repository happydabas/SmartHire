from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.profiles import JobSeekerProfile
from app.schemas.profiles import ProfileCreate, ProfileUpdate

class ProfileRepository:
    """
    Handles all direct PostgreSQL transactions for the JobSeekerProfile model
    using SQLAlchemy 2.0 AsyncSession.
    """

    async def get_by_user_id(self, db: AsyncSession, user_id: int) -> Optional[JobSeekerProfile]:
        """
        Retrieve a profile record associated with the user.
        """
        stmt = select(JobSeekerProfile).where(JobSeekerProfile.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: ProfileCreate,
        user_id: int
    ) -> JobSeekerProfile:
        """
        Insert and persist a new profile record.
        """
        db_obj = JobSeekerProfile(
            user_id=user_id,
            full_name=obj_in.full_name,
            phone_number=obj_in.phone_number,
            date_of_birth=obj_in.date_of_birth,
            gender=obj_in.gender,
            address=obj_in.address,
            city=obj_in.city,
            state=obj_in.state,
            country=obj_in.country,
            linkedin_url=obj_in.linkedin_url,
            github_url=obj_in.github_url,
            portfolio_url=obj_in.portfolio_url,
            professional_summary=obj_in.professional_summary,
            profile_photo_url=obj_in.profile_photo_url
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: JobSeekerProfile,
        obj_in: ProfileUpdate
    ) -> JobSeekerProfile:
        """
        Update fields of an existing profile record.
        """
        update_data = obj_in.model_dump()
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
