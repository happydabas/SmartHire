from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy import or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

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
        stmt = select(Job).options(
            selectinload(Job.recruiter),
            selectinload(Job.pipeline),
            selectinload(Job.job_recruiter_assignments)
        ).where(
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
        stmt = select(Job).options(
            selectinload(Job.recruiter),
            selectinload(Job.pipeline),
            selectinload(Job.company),
            selectinload(Job.job_recruiter_assignments)
        ).where(
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
        skills: Optional[List[str]] = None,
        sort: Optional[str] = "latest"
    ) -> Tuple[int, List[Job]]:
        """
        Retrieve a paginated subset of active OPEN job postings along with the total records count.
        Excludes DRAFT, CLOSED, and DELETED listings.
        """
        # 1. Base query
        stmt = select(Job).options(
            selectinload(Job.recruiter),
            selectinload(Job.pipeline),
            selectinload(Job.company),
            selectinload(Job.job_recruiter_assignments)
        ).where(
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
        
        # 4. Apply ordering based on sort parameter
        if sort == "oldest":
            stmt = stmt.order_by(Job.created_at.asc(), Job.id.asc())
        elif sort == "salary_desc":
            stmt = stmt.order_by(func.coalesce(Job.salary_max, Job.salary_min).desc().nullslast(), Job.id.desc())
        elif sort == "salary_asc":
            stmt = stmt.order_by(func.coalesce(Job.salary_min, Job.salary_max).asc().nullslast(), Job.id.asc())
        elif sort == "company_asc":
            stmt = stmt.outerjoin(Company, Job.company_id == Company.id).order_by(Company.name.asc(), Job.id.asc())
        elif sort == "company_desc":
            stmt = stmt.outerjoin(Company, Job.company_id == Company.id).order_by(Company.name.desc(), Job.id.desc())
        elif sort == "title_asc":
            stmt = stmt.order_by(Job.title.asc(), Job.id.asc())
        elif sort == "title_desc":
            stmt = stmt.order_by(Job.title.desc(), Job.id.desc())
        else: # "latest"
            stmt = stmt.order_by(Job.created_at.desc(), Job.id.desc())

        # 5. Apply offset and limit to final query
        results_stmt = stmt.offset((page - 1) * limit).limit(limit)
        results_result = await db.execute(results_stmt)
        jobs = list(results_result.scalars().all())
        
        return total_records, jobs

    async def get_company_jobs(self, db: AsyncSession, company_id: int) -> List[Job]:
        """
        Retrieve all active (non-soft-deleted) job postings belonging to the company.
        """
        stmt = select(Job).options(
            selectinload(Job.recruiter),
            selectinload(Job.pipeline),
            selectinload(Job.job_recruiter_assignments)
        ).where(
            Job.company_id == company_id,
            Job.is_deleted == False
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_company_jobs_for_user(
        self,
        db: AsyncSession,
        company_id: int,
        user_id: int,
        is_owner: bool
    ) -> List[Job]:
        """
        Retrieve active jobs for a company based on recruiter permissions.
        - Company Owner: receives all non-soft-deleted company jobs.
        - Normal Recruiter: receives ONLY non-soft-deleted jobs assigned to them in job_recruiters.
        """
        from app.models.job_recruiters import JobRecruiter

        if is_owner:
            stmt = select(Job).options(
                selectinload(Job.recruiter),
                selectinload(Job.pipeline),
                selectinload(Job.job_recruiter_assignments)
            ).where(
                Job.company_id == company_id,
                Job.is_deleted == False
            )
        else:
            stmt = (
                select(Job)
                .options(
                    selectinload(Job.recruiter),
                    selectinload(Job.pipeline),
                    selectinload(Job.job_recruiter_assignments)
                )
                .join(JobRecruiter, Job.id == JobRecruiter.job_id)
                .where(
                    Job.company_id == company_id,
                    JobRecruiter.recruiter_id == user_id,
                    Job.is_deleted == False
                )
                .distinct()
            )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def is_recruiter_assigned(self, db: AsyncSession, job_id: int, recruiter_id: int) -> bool:
        """
        Check if a recruiter is explicitly assigned to a job in job_recruiters.
        """
        from app.models.job_recruiters import JobRecruiter
        stmt = select(JobRecruiter.job_id).where(
            JobRecruiter.job_id == job_id,
            JobRecruiter.recruiter_id == recruiter_id
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none() is not None

    async def get_assigned_recruiter_ids(self, db: AsyncSession, job_id: int) -> List[int]:
        """
        Retrieve list of recruiter IDs assigned to a specific job.
        """
        from app.models.job_recruiters import JobRecruiter
        stmt = select(JobRecruiter.recruiter_id).where(JobRecruiter.job_id == job_id)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def update_job_recruiters(
        self,
        db: AsyncSession,
        job_id: int,
        recruiter_ids: List[int]
    ) -> List[int]:
        """
        Update the recruiter assignments for a job in job_recruiters table.
        Removes unselected recruiters and adds newly selected recruiters.
        """
        from sqlalchemy import delete
        from app.models.job_recruiters import JobRecruiter

        # Delete existing assignments
        del_stmt = delete(JobRecruiter).where(JobRecruiter.job_id == job_id)
        await db.execute(del_stmt)

        # Add new assignments
        unique_rec_ids = list(set(recruiter_ids))
        for rid in unique_rec_ids:
            new_assign = JobRecruiter(job_id=job_id, recruiter_id=rid)
            db.add(new_assign)

        await db.commit()
        return unique_rec_ids

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
        obj_in: JobUpdate,
        auto_commit: bool = True
    ) -> Job:
        """
        Update the attributes of an existing Job posting.
        """
        update_data = obj_in.model_dump(exclude={"required_skills", "hiring_pipeline", "recruiter_ids"}, exclude_unset=True)
        
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        if auto_commit:
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
