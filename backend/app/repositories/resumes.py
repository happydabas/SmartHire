import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.resumes import Resume

class ResumeRepository:
    """
    Handles all direct PostgreSQL transactions for the Resume model
    using SQLAlchemy 2.0 AsyncSession.
    """

    async def get_by_user_id(self, db: AsyncSession, user_id: int) -> Optional[Resume]:
        """
        Retrieve the resume metadata record associated with the user.
        """
        stmt = select(Resume).where(Resume.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create_or_update_metadata(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        file_name: str,
        file_path: str,
        file_size: int
    ) -> Resume:
        """
        Insert a new resume record or update an existing record's metadata.
        """
        db_obj = await self.get_by_user_id(db, user_id=user_id)
        
        if db_obj:
            db_obj.file_name = file_name
            db_obj.file_path = file_path
            db_obj.file_size = file_size
            db_obj.uploaded_at = datetime.datetime.now(datetime.timezone.utc)
        else:
            db_obj = Resume(
                user_id=user_id,
                file_name=file_name,
                file_path=file_path,
                file_size=file_size,
                uploaded_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(db_obj)
            
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(
        self,
        db: AsyncSession,
        *,
        db_obj: Resume
    ) -> None:
        """
        Permanently delete the resume database record.
        """
        await db.delete(db_obj)
        await db.commit()
