from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import sqlalchemy as sa

from app.models.skills import Skill
from app.models.resume_skills import ResumeSkill

class SkillRepository:
    """
    Handles queries and creations for the master Skill registry.
    """
    
    async def get_by_id(self, db: AsyncSession, skill_id: int) -> Optional[Skill]:
        """Retrieve a master skill by ID."""
        stmt = select(Skill).where(Skill.id == skill_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_ids(self, db: AsyncSession, skill_ids: List[int]) -> List[Skill]:
        """Retrieve multiple master skills by their IDs."""
        stmt = select(Skill).where(Skill.id.in_(skill_ids))
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_resume_skills_sorted(self, db: AsyncSession, resume_id: int) -> List[Skill]:
        """
        Retrieve all skills associated with the resume, sorted alphabetically by skill_name.
        """
        stmt = (
            select(Skill)
            .join(ResumeSkill, Skill.id == ResumeSkill.skill_id)
            .where(ResumeSkill.resume_id == resume_id)
            .order_by(Skill.skill_name.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_association(self, db: AsyncSession, resume_id: int, skill_id: int) -> Optional[ResumeSkill]:
        """Check if a specific skill is associated with a resume."""
        stmt = select(ResumeSkill).where(
            ResumeSkill.resume_id == resume_id,
            ResumeSkill.skill_id == skill_id
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def add_associations(self, db: AsyncSession, resume_id: int, skill_ids: List[int]) -> List[ResumeSkill]:
        """Associate multiple skills with a resume."""
        associations = []
        for s_id in skill_ids:
            assoc = ResumeSkill(resume_id=resume_id, skill_id=s_id)
            db.add(assoc)
            associations.append(assoc)
        await db.commit()
        # Refresh all associations
        for assoc in associations:
            await db.refresh(assoc)
        return associations

    async def delete_association(self, db: AsyncSession, association: ResumeSkill) -> None:
        """Remove a skill association from a resume."""
        await db.delete(association)
        await db.commit()

    async def get_by_name(self, db: AsyncSession, skill_name: str) -> Optional[Skill]:
        """
        Query a master skill record by its unique name (case-insensitive check is best).
        """
        stmt = select(Skill).where(sa.func.lower(Skill.skill_name) == skill_name.lower())
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, skill_name: str, category: str = "Technical") -> Skill:
        """
        Create and persist a new master skill registry entry.
        """
        db_skill = Skill(
            skill_name=skill_name,
            category=category
        )
        db.add(db_skill)
        await db.commit()
        await db.refresh(db_skill)
        return db_skill
