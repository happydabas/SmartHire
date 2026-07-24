from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.education import EducationRepository
from app.repositories.resumes import ResumeRepository
from app.models.education import Education
from app.models.users import User, UserRole
from app.schemas.education import EducationCreate, EducationUpdate

class EducationService:
    """
    Handles business logic for Candidate Education profiles.
    Enforces role controls, auto-provisions empty resume anchors,
    and checks profile record ownership.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.education_repo = EducationRepository()
        self.resume_repo = ResumeRepository()

    async def get_user_resume_id(self, user_id: int) -> int:
        """
        Retrieves the user's resume ID, auto-creating an empty resume record if none exists yet.
        """
        resume = await self.resume_repo.get_by_user_id(self.db, user_id=user_id)
        if not resume:
            resume = await self.resume_repo.create_or_update_metadata(
                self.db,
                user_id=user_id,
                file_name=None,
                file_path=None,
                file_size=0
            )
        return resume.id

    async def create_education(self, obj_in: EducationCreate, current_user: User) -> Education:
        """
        Add a new education record.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can manage education profiles."
            )
            
        resume_id = await self.get_user_resume_id(current_user.id)
        return await self.education_repo.create(self.db, obj_in=obj_in, resume_id=resume_id)

    async def get_education_list(self, current_user: User) -> List[Education]:
        """
        List all education records for the current user, sorted by start date (latest first).
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can retrieve education profiles."
            )
            
        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume:
            return []
            
        return await self.education_repo.get_by_resume_id_sorted(self.db, resume_id=resume.id)

    async def _verify_ownership(self, education: Education, current_user: User) -> None:
        """
        Verify that the education record belongs to the current user's resume.
        """
        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume or education.resume_id != resume.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this education record."
            )

    async def update_education(
        self,
        education_id: int,
        obj_in: EducationUpdate,
        current_user: User
    ) -> Education:
        """
        Modify an existing education record.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can update education profiles."
            )
            
        education = await self.education_repo.get_by_id(self.db, education_id=education_id)
        if not education:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Education record not found."
            )
            
        await self._verify_ownership(education, current_user)
        return await self.education_repo.update(self.db, db_obj=education, obj_in=obj_in)

    async def delete_education(self, education_id: int, current_user: User) -> None:
        """
        Remove an existing education record.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can delete education profiles."
            )
            
        education = await self.education_repo.get_by_id(self.db, education_id=education_id)
        if not education:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Education record not found."
            )
            
        await self._verify_ownership(education, current_user)
        await self.education_repo.delete(self.db, db_obj=education)
