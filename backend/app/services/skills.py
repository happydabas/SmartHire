from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.skills import SkillRepository
from app.repositories.resumes import ResumeRepository
from app.models.skills import Skill
from app.models.users import User, UserRole
from app.schemas.skills import SkillsAdd

class SkillService:
    """
    Handles business logic for Candidate Skills profiles.
    Enforces role controls, duplicate guards, existence validations,
    and checks profile record ownership.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.skill_repo = SkillRepository()
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

    async def add_skills(self, obj_in: SkillsAdd, current_user: User) -> List[Skill]:
        """
        Associate one or multiple skills with the user's profile/resume.
        """
        # 1. Enforce Role constraint
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can manage profile skills."
            )

        # 2. Check for duplicate IDs in the request body input
        if len(obj_in.skill_ids) != len(set(obj_in.skill_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate skill IDs provided in the request payload."
            )

        # 3. Check that all requested skills exist in the master registry
        matched_skills = await self.skill_repo.get_by_ids(self.db, skill_ids=obj_in.skill_ids)
        if len(matched_skills) != len(obj_in.skill_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more specified skills do not exist in the catalog."
            )

        # 4. Check for already associated skills (prevent duplicates)
        resume_id = await self.get_user_resume_id(current_user.id)
        for s_id in obj_in.skill_ids:
            existing = await self.skill_repo.get_association(self.db, resume_id=resume_id, skill_id=s_id)
            if existing:
                # Find the skill name for cleaner error description
                skill_name = next((s.skill_name for s in matched_skills if s.id == s_id), f"ID {s_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Skill '{skill_name}' is already associated with this profile."
                )

        # 5. Create associations and return the corresponding master Skill models
        await self.skill_repo.add_associations(self.db, resume_id=resume_id, skill_ids=obj_in.skill_ids)
        # Return the loaded master skill details
        return matched_skills

    async def get_skills_list(self, current_user: User) -> List[Skill]:
        """
        List all skills associated with the user's profile, sorted alphabetically.
        """
        # Enforce Role constraint
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can retrieve profile skills."
            )

        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume:
            return []

        return await self.skill_repo.get_resume_skills_sorted(self.db, resume_id=resume.id)

    async def remove_skill(self, skill_id: int, current_user: User) -> None:
        """
        Remove a skill association from the user's profile.
        """
        # Enforce Role constraint
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can delete profile skills."
            )

        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill association not found."
            )

        # Retrieve the association (ensures ownership validation)
        association = await self.skill_repo.get_association(self.db, resume_id=resume.id, skill_id=skill_id)
        if not association:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill association not found on this profile."
            )

        await self.skill_repo.delete_association(self.db, association=association)
