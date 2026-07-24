from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy import or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.jobs import Job, JobStatus, JobType, ExperienceLevel, WorkMode
from app.models.companies import Company
from app.schemas.jobs import JobCreate, JobUpdate

class JobRepository:
    """
    Handles all direct PostgreSQL transactions for the Job model
    using SQLAlchemy 2.0 AsyncSession.
    """
    
    async def get_by_id(self, db: AsyncSession, job_id: int) -> Optional[Job]:
        """
        Retrieve an active (non-soft-deleted) job posting by its primary key ID.
        """
        stmt = select(Job).where(
            Job.id == job_id,
            Job.is_deleted == False
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_open_jobs(
        self,
        db: AsyncSession,
        *,
        company_id: Optional[int] = None,
        location: Optional[str] = None,
        work_mode: Optional[WorkMode] = None,
        employment_type: Optional[JobType] = None,
        experience_level: Optional[ExperienceLevel] = None,
        min_salary: Optional[Decimal] = None,
        max_salary: Optional[Decimal] = None,
        skills: Optional[List[str]] = None
    ) -> List[Job]:
        """
        Retrieve all active OPEN job postings with optional query filtering.
        Excludes DRAFT, CLOSED, and DELETED listings.
        """
        stmt = select(Job).where(
            Job.status == JobStatus.OPEN,
            Job.is_deleted == False
        )
        
        if company_id is not None:
            stmt = stmt.where(Job.company_id == company_id)
            
        if location:
            stmt = stmt.where(Job.location.ilike(f"%{location.strip()}%"))
            
        if work_mode is not None:
            stmt = stmt.where(Job.work_mode == work_mode)
            
        if employment_type is not None:
            stmt = stmt.where(Job.job_type == employment_type)
            
        if experience_level is not None:
            stmt = stmt.where(Job.experience_level == experience_level)
            
        if min_salary is not None:
            stmt = stmt.where(Job.salary_min >= min_salary)
            
        if max_salary is not None:
            stmt = stmt.where(Job.salary_max <= max_salary)
            
        if skills:
            from app.models.job_required_skills import JobRequiredSkill
            from app.models.skills import Skill
            
            clean_skills = [s.strip().lower() for s in skills if s.strip()]
            if clean_skills:
                stmt = (
                    stmt.join(JobRequiredSkill)
                    .join(Skill)
                    .where(func.lower(Skill.skill_name).in_(clean_skills))
                    .distinct()
                )
                
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_open_jobs_paginated(
        self,
        db: AsyncSession,
        *,
        page: int,
        limit: int,
        company_id: Optional[int] = None,
        location: Optional[str] = None,
        work_mode: Optional[WorkMode] = None,
        employment_type: Optional[JobType] = None,
        experience_level: Optional[ExperienceLevel] = None,
        min_salary: Optional[Decimal] = None,
        max_salary: Optional[Decimal] = None,
        skills: Optional[List[str]] = None
    ) -> Tuple[int, List[Job]]:
        """
        Retrieve a paginated subset of active OPEN job postings along with the total records count.
        Excludes DRAFT, CLOSED, and DELETED listings.
        """
        # 1. Base query
        stmt = select(Job).where(
            Job.status == JobStatus.OPEN,
            Job.is_deleted == False
        )
        
        # 2. Apply dynamic filters
        if company_id is not None:
            stmt = stmt.where(Job.company_id == company_id)
            
        if location:
            stmt = stmt.where(Job.location.ilike(f"%{location.strip()}%"))
            
        if work_mode is not None:
            stmt = stmt.where(Job.work_mode == work_mode)
            
        if employment_type is not None:
            stmt = stmt.where(Job.job_type == employment_type)
            
        if experience_level is not None:
            stmt = stmt.where(Job.experience_level == experience_level)
            
        if min_salary is not None:
            stmt = stmt.where(Job.salary_min >= min_salary)
            
        if max_salary is not None:
            stmt = stmt.where(Job.salary_max <= max_salary)
            
        if skills:
            from app.models.job_required_skills import JobRequiredSkill
            from app.models.skills import Skill
            
            clean_skills = [s.strip().lower() for s in skills if s.strip()]
            if clean_skills:
                stmt = (
                    stmt.join(JobRequiredSkill)
                    .join(Skill)
                    .where(func.lower(Skill.skill_name).in_(clean_skills))
                    .distinct()
                )
                
        # 3. Compile count query (cloning the SELECT with only count parameters)
        count_stmt = stmt.with_only_columns(func.count(Job.id.distinct()))
        count_result = await db.execute(count_stmt)
        total_records = count_result.scalar_one()
        
        # 4. Apply offset and limit to final query
        results_stmt = stmt.offset((page - 1) * limit).limit(limit)
        results_result = await db.execute(results_stmt)
        jobs = list(results_result.scalars().all())
        
        return total_records, jobs

    async def get_company_jobs(self, db: AsyncSession, company_id: int) -> List[Job]:
        """
        Retrieve all active (non-soft-deleted) job postings belonging to the company.
        """
        stmt = select(Job).where(
            Job.company_id == company_id,
            Job.is_deleted == False
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_recruiter_jobs(self, db: AsyncSession, recruiter_id: int) -> List[Job]:
        """
        Retrieve all active (non-soft-deleted) job postings created by the recruiter.
        """
        stmt = select(Job).where(
            Job.recruiter_id == recruiter_id,
            Job.is_deleted == False
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_draft_jobs_by_company(self, db: AsyncSession, company_id: int) -> List[Job]:
        """
        Retrieve all active draft job postings belonging to the company.
        """
        stmt = select(Job).where(
            Job.company_id == company_id,
            Job.status == JobStatus.DRAFT,
            Job.is_deleted == False
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: JobCreate,
        company_id: int,
        recruiter_id: int
    ) -> Job:
        """
        Insert and persist a new Job posting.
        """
        db_job = Job(
            company_id=company_id,
            recruiter_id=recruiter_id,
            title=obj_in.title,
            description=obj_in.description,
            location=obj_in.location,
            job_type=obj_in.job_type,
            experience_level=obj_in.experience_level,
            work_mode=obj_in.work_mode,
            status=obj_in.status,
            salary_min=obj_in.salary_min,
            salary_max=obj_in.salary_max,
            application_deadline=obj_in.application_deadline
        )
        db.add(db_job)
        await db.commit()
        await db.refresh(db_job)
        return db_job

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: Job,
        obj_in: JobUpdate
    ) -> Job:
        """
        Update the attributes of an existing Job posting.
        """
        update_data = obj_in.model_dump(exclude={"required_skills", "hiring_pipeline"})
        
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def soft_delete(
        self,
        db: AsyncSession,
        *,
        db_obj: Job
    ) -> Job:
        """
        Soft-delete a job posting by flagging is_deleted to True.
        """
        db_obj.is_deleted = True
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def close(
        self,
        db: AsyncSession,
        *,
        db_obj: Job
    ) -> Job:
        """
        Close a job posting by setting its status to CLOSED.
        """
        db_obj.status = JobStatus.CLOSED
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def publish(
        self,
        db: AsyncSession,
        *,
        db_obj: Job
    ) -> Job:
        """
        Publish a job posting by setting its status to OPEN.
        """
        db_obj.status = JobStatus.OPEN
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def search_jobs(self, db: AsyncSession, query_str: str) -> List[Job]:
        """
        Search OPEN job postings by Job Title, Company Name, or Location.
        Case-insensitive and handles partial matches.
        """
        stmt = (
            select(Job)
            .join(Company)
            .where(
                Job.status == JobStatus.OPEN,
                Job.is_deleted == False,
                or_(
                    Job.title.ilike(f"%{query_str}%"),
                    Job.location.ilike(f"%{query_str}%"),
                    Company.name.ilike(f"%{query_str}%")
                )
            )
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
