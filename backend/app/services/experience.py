from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.experience import ExperienceRepository
from app.repositories.resumes import ResumeRepository
from app.models.experience import Experience
from app.models.users import User, UserRole
from app.schemas.experience import ExperienceCreate, ExperienceUpdate

class ExperienceService:
    """
    Handles business logic for Candidate Experience profiles.
    Enforces role controls, auto-provisions empty resume anchors,
    and checks profile record ownership.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.experience_repo = ExperienceRepository()
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

    async def create_experience(self, obj_in: ExperienceCreate, current_user: User) -> Experience:
        """
        Add a new experience record.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can manage experience profiles."
            )
            
        resume_id = await self.get_user_resume_id(current_user.id)
        return await self.experience_repo.create(self.db, obj_in=obj_in, resume_id=resume_id)

    async def get_experience_list(self, current_user: User) -> List[Experience]:
        """
        List all experience records for the current user, sorted by start date (latest first).
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can retrieve experience profiles."
            )
            
        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume:
            return []
            
        return await self.experience_repo.get_by_resume_id_sorted(self.db, resume_id=resume.id)

    async def _verify_ownership(self, experience: Experience, current_user: User) -> None:
        """
        Verify that the experience record belongs to the current user's resume.
        """
        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume or experience.resume_id != resume.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this experience record."
            )

    async def update_experience(
        self,
        experience_id: int,
        obj_in: ExperienceUpdate,
        current_user: User
    ) -> Experience:
        """
        Modify an existing experience record.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can update experience profiles."
            )
            
        experience = await self.experience_repo.get_by_id(self.db, experience_id=experience_id)
        if not experience:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience record not found."
            )
            
        await self._verify_ownership(experience, current_user)
        return await self.experience_repo.update(self.db, db_obj=experience, obj_in=obj_in)

    async def delete_experience(self, experience_id: int, current_user: User) -> None:
        """
        Remove an existing experience record.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can delete experience profiles."
            )
            
        experience = await self.experience_repo.get_by_id(self.db, experience_id=experience_id)
        if not experience:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience record not found."
            )
            
        await self._verify_ownership(experience, current_user)
        await self.experience_repo.delete(self.db, db_obj=experience)
