from typing import List, Optional, Tuple
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.repositories.jobs import JobRepository
from app.repositories.skills import SkillRepository
from app.repositories.companies import CompanyRepository
from app.schemas.jobs import JobCreate, JobUpdate
from app.models.jobs import Job, JobStatus, JobType, ExperienceLevel, WorkMode
from app.models.skills import Skill
from app.models.job_required_skills import JobRequiredSkill
from app.models.pipelines import HiringPipeline, PipelineStage
from app.models.users import User, UserRole
from app.models.companies import Company
from app.core.cache import ttl_cache

class JobService:
    """
    Handles Job posting operations.
    Enforces authorization constraints, links company dependencies,
    registers master skills, and configures hiring pipelines.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.job_repo = JobRepository()
        self.skill_repo = SkillRepository()
        self.company_repo = CompanyRepository()

    async def get_user_company_id(self, user: User) -> int:
        """
        Determines the company ID association for the authenticated user.
        """
        if user.role == UserRole.RECRUITER:
            if not user.company_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Recruiter user is not associated with any company."
                )
            return user.company_id
            
        elif user.role == UserRole.COMPANY_OWNER:
            stmt = select(Company).where(Company.owner_id == user.id)
            result = await self.db.execute(stmt)
            company = result.scalars().first()
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Company Owner does not have a registered company. Please register a company first."
                )
            if user.company_id != company.id:
                user.company_id = company.id
                self.db.add(user)
                await self.db.commit()
            return company.id
            
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Company Owners and Recruiters can create jobs."
            )

    async def create_job(self, obj_in: JobCreate, current_user: User) -> Job:
        """
        Register a new Job Posting.
        """
        company_id = await self.get_user_company_id(current_user)

        job = await self.job_repo.create(
            self.db,
            obj_in=obj_in,
            company_id=company_id,
            recruiter_id=current_user.id
        )

        for skill_name in obj_in.required_skills:
            clean_name = skill_name.strip()
            if not clean_name:
                continue
                
            skill = await self.skill_repo.get_by_name(self.db, skill_name=clean_name)
            if not skill:
                skill = await self.skill_repo.create(
                    self.db, 
                    skill_name=clean_name, 
                    category="Technical"
                )
                
            job_skill = JobRequiredSkill(
                job_id=job.id,
                skill_id=skill.id
            )
            self.db.add(job_skill)

        pipeline = HiringPipeline(job_id=job.id)
        self.db.add(pipeline)
        await self.db.flush()

        for idx, stage_name in enumerate(obj_in.hiring_pipeline):
            clean_stage = stage_name.strip()
            if not clean_stage:
                continue
                
            stage = PipelineStage(
                pipeline_id=pipeline.id,
                stage_name=clean_stage,
                stage_order=idx + 1
            )
            self.db.add(stage)

        # Create recruiter assignments in job_recruiters
        assign_ids = obj_in.recruiter_ids if (obj_in.recruiter_ids and len(obj_in.recruiter_ids) > 0) else [current_user.id]
        await self.job_repo.update_job_recruiters(self.db, job.id, assign_ids)

        await self.db.commit()
        await self.db.refresh(job)

        ttl_cache.invalidate_prefix("jobs:")
        return job

    async def get_job(self, job_id: int) -> Job:
        """
        Retrieve a job record by primary key ID.
        Raises HTTP 404 if listing is not found.
        """
        job = await self.job_repo.get_by_id(self.db, job_id=job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found."
            )
        return job

    async def get_job_for_user(self, job_id: int, current_user: User) -> Job:
        """
        Retrieve a job record while enforcing recruiter access authorization.
        - Company Owner: Can view any job belonging to their company.
        - Normal Recruiter: Can ONLY view jobs assigned to them in job_recruiters.
        Raises 403 if unauthorized or 404 if not found.
        """
        job = await self.get_job(job_id=job_id)
        
        is_owner = bool(current_user.is_owner or current_user.role == UserRole.COMPANY_OWNER)
        
        if is_owner:
            if current_user.company_id and job.company_id != current_user.company_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to access jobs from another company."
                )
            return job

        # Normal recruiter authorization check
        if job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access jobs from another company."
            )

        is_assigned = await self.job_repo.is_recruiter_assigned(self.db, job_id=job.id, recruiter_id=current_user.id)
        if not is_assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view or access this job posting."
            )
        return job

    async def update_job_assignments(self, job_id: int, recruiter_ids: List[int], current_user: User) -> List[int]:
        """
        Modify recruiter assignments for a job posting. Restrict to Company Owner.
        """
        is_owner = bool(current_user.is_owner or current_user.role == UserRole.COMPANY_OWNER)
        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the Company Owner is authorized to modify recruiter assignments."
            )

        job = await self.get_job(job_id=job_id)
        if current_user.company_id and job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify jobs from another company."
            )

        updated_ids = await self.job_repo.update_job_recruiters(self.db, job_id=job.id, recruiter_ids=recruiter_ids)
        ttl_cache.invalidate_prefix("jobs:")
        return updated_ids

    async def update_job(self, job_id: int, obj_in: JobUpdate, current_user: User) -> Job:
        """
        Modify details of an existing job posting.
        """
        job = await self.get_job(job_id=job_id)
        
        authorized = False
        if current_user.role == UserRole.RECRUITER and job.recruiter_id == current_user.id:
            authorized = True
        elif current_user.role == UserRole.COMPANY_OWNER:
            company = await self.company_repo.get_by_id(self.db, company_id=job.company_id)
            if company and company.owner_id == current_user.id:
                authorized = True
                
        if not authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to edit this job posting."
            )
            
        job.required_skills.clear()
        
        for skill_name in obj_in.required_skills:
            clean_name = skill_name.strip()
            if not clean_name:
                continue
                
            skill = await self.skill_repo.get_by_name(self.db, skill_name=clean_name)
            if not skill:
                skill = await self.skill_repo.create(
                    self.db, 
                    skill_name=clean_name, 
                    category="Technical"
                )
                
            job_skill = JobRequiredSkill(
                job_id=job.id,
                skill_id=skill.id
            )
            self.db.add(job_skill)
            
        if not job.pipeline:
            pipeline = HiringPipeline(job_id=job.id)
            self.db.add(pipeline)
            await self.db.flush()
            job.pipeline = pipeline
        else:
            job.pipeline.stages.clear()
            
        for idx, stage_name in enumerate(obj_in.hiring_pipeline):
            clean_stage = stage_name.strip()
            if not clean_stage:
                continue
                
            stage = PipelineStage(
                pipeline_id=job.pipeline.id,
                stage_name=clean_stage,
                stage_order=idx + 1
            )
            self.db.add(stage)
            
        await self.job_repo.update(
            self.db,
            db_obj=job,
            obj_in=obj_in
        )
        
        await self.db.commit()
        await self.db.refresh(job)
        
        return job

    async def delete_job(self, job_id: int, current_user: User) -> Job:
        """
        Soft-delete an existing job posting.
        """
        job = await self.get_job(job_id=job_id)
        
        authorized = False
        if current_user.role == UserRole.RECRUITER and job.recruiter_id == current_user.id:
            authorized = True
        elif current_user.role == UserRole.COMPANY_OWNER:
            company = await self.company_repo.get_by_id(self.db, company_id=job.company_id)
            if company and company.owner_id == current_user.id:
                authorized = True
                
        if not authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete this job posting."
            )
            
        return await self.job_repo.soft_delete(self.db, db_obj=job)

    async def close_job(self, job_id: int, current_user: User) -> Job:
        """
        Close an existing job posting by setting its status to CLOSED.
        """
        job = await self.get_job(job_id=job_id)
        
        if job.status == JobStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This job posting is already closed."
            )
            
        authorized = False
        if current_user.role == UserRole.RECRUITER and job.recruiter_id == current_user.id:
            authorized = True
        elif current_user.role == UserRole.COMPANY_OWNER:
            company = await self.company_repo.get_by_id(self.db, company_id=job.company_id)
            if company and company.owner_id == current_user.id:
                authorized = True
                
        if not authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to close this job posting."
            )
            
        return await self.job_repo.close(self.db, db_obj=job)

    async def get_draft_jobs(self, current_user: User) -> List[Job]:
        """
        List all draft jobs belonging to the logged-in user's company.
        """
        if current_user.role not in [UserRole.RECRUITER, UserRole.COMPANY_OWNER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Company Owners and Recruiters can list draft job postings."
            )
            
        company_id = await self.get_user_company_id(current_user)
        return await self.job_repo.get_draft_jobs_by_company(self.db, company_id=company_id)

    async def publish_job(self, job_id: int, current_user: User) -> Job:
        """
        Publish a job posting by moving its status from DRAFT to OPEN.
        """
        job = await self.get_job(job_id=job_id)
        
        if job.status != JobStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only draft jobs can be published. Current status: {job.status.value}."
            )
            
        authorized = False
        if current_user.role == UserRole.RECRUITER and job.recruiter_id == current_user.id:
            authorized = True
        elif current_user.role == UserRole.COMPANY_OWNER:
            company = await self.company_repo.get_by_id(self.db, company_id=job.company_id)
            if company and company.owner_id == current_user.id:
                authorized = True
                
        if not authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to publish this job posting."
            )
            
        if not job.title or not job.title.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title is required to publish.")
        if not job.description or not job.description.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Description is required to publish.")
        if not job.location or not job.location.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Location is required to publish.")
        if not job.required_skills:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one required skill must be added before publishing.")
        if not job.pipeline or not job.pipeline.stages:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hiring pipeline stages must be set before publishing.")
            
        return await self.job_repo.publish(self.db, db_obj=job)

    def _map_work_mode(self, val: Optional[str]) -> Optional[WorkMode]:
        """Case-insensitively map query string to WorkMode enum."""
        if not val or not val.strip():
            return None
        v = val.strip().upper()
        for wm in WorkMode:
            if wm.name == v or wm.value.upper() == v:
                return wm
        return None

    def _map_employment_type(self, val: Optional[str]) -> Optional[JobType]:
        """Case-insensitively map query string to JobType enum."""
        if not val or not val.strip():
            return None
        v = val.strip().upper()
        for jt in JobType:
            if jt.name == v or jt.value.upper().replace("-", "_") == v:
                return jt
        return None

    def _map_experience_level(self, val: Optional[str]) -> Optional[ExperienceLevel]:
        """Case-insensitively map query string to ExperienceLevel enum."""
        if not val or not val.strip():
            return None
        v = val.strip().upper()
        if v == "FRESHER":
            return ExperienceLevel.FRESHER
        elif v in ("JUNIOR", "ENTRY"):
            return ExperienceLevel.ENTRY
        elif v in ("MID_LEVEL", "MID"):
            return ExperienceLevel.MID
        elif v == "SENIOR":
            return ExperienceLevel.SENIOR
        for el in ExperienceLevel:
            if el.name == v or el.value.upper() == v:
                return el
        return None

    async def get_open_jobs(
        self,
        *,
        company_id: Optional[int] = None,
        location: Optional[str] = None,
        work_mode: Optional[str] = None,
        employment_type: Optional[str] = None,
        experience_level: Optional[str] = None,
        min_salary: Optional[Decimal] = None,
        max_salary: Optional[Decimal] = None,
        skills: Optional[str] = None
    ) -> List[Job]:
        """
        Retrieve all active OPEN job postings with optional query filtering.
        """
        wm = self._map_work_mode(work_mode)
        jt = self._map_employment_type(employment_type)
        el = self._map_experience_level(experience_level)
        
        skills_list = []
        if skills and skills.strip():
            skills_list = [s.strip() for s in skills.split(",") if s.strip()]
            
        return await self.job_repo.get_open_jobs(
            self.db,
            company_id=company_id,
            location=location,
            work_mode=wm,
            employment_type=jt,
            experience_level=el,
            min_salary=min_salary,
            max_salary=max_salary,
            skills=skills_list
        )

    async def get_open_jobs_paginated(
        self,
        *,
        page: int,
        limit: int,
        company_id: Optional[int] = None,
        location: Optional[str] = None,
        work_mode: Optional[str] = None,
        employment_type: Optional[str] = None,
        experience_level: Optional[str] = None,
        min_salary: Optional[Decimal] = None,
        max_salary: Optional[Decimal] = None,
        skills: Optional[str] = None
    ) -> dict:
        """
        Retrieve a paginated payload of active OPEN job listings along with metadata.
        Enforces validation parameter checks.
        """
        # Validate parameters
        if page < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Page number parameter must be greater than or equal to 1."
            )
        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit parameter must be between 1 and 100 inclusive."
            )
            
        # Parse enums
        wm = self._map_work_mode(work_mode)
        jt = self._map_employment_type(employment_type)
        el = self._map_experience_level(experience_level)
        
        # Parse skills
        skills_list = []
        if skills and skills.strip():
            skills_list = [s.strip() for s in skills.split(",") if s.strip()]
            
        from app.core.cache import ttl_cache

        # Cache key construction for open jobs listing
        cache_key = f"jobs:page={page}:limit={limit}:c={company_id}:l={location}:wm={wm}:jt={jt}:el={el}:sal={min_salary}-{max_salary}:s={skills}"
        cached_val = ttl_cache.get(cache_key)
        if cached_val is not None:
            return cached_val

        # Query repository
        total_records, jobs = await self.job_repo.get_open_jobs_paginated(
            self.db,
            page=page,
            limit=limit,
            company_id=company_id,
            location=location,
            work_mode=wm,
            employment_type=jt,
            experience_level=el,
            min_salary=min_salary,
            max_salary=max_salary,
            skills=skills_list
        )
        
        # Calculate pagination parameters
        import math
        total_pages = math.ceil(total_records / limit) if total_records > 0 else 0
        has_next = page < total_pages
        has_previous = page > 1
        
        res = {
            "page": page,
            "limit": limit,
            "total_records": total_records,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous,
            "jobs": jobs
        }
        
        ttl_cache.set(cache_key, res, ttl_seconds=20.0)
        return res

    async def get_company_jobs(self, company_id: int, current_user: User) -> List[Job]:
        """
        Retrieve all active job postings belonging to the specified company according to user authorization:
        - Company Owner: receives all company jobs.
        - Normal Recruiter: receives ONLY jobs assigned to them in job_recruiters.
        """
        company = await self.company_repo.get_by_id(self.db, company_id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company profile not found."
            )
            
        if current_user.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this company's job postings."
            )
            
        is_owner = bool(current_user.is_owner or current_user.role == UserRole.COMPANY_OWNER or company.owner_id == current_user.id)
        return await self.job_repo.get_company_jobs_for_user(
            self.db,
            company_id=company_id,
            user_id=current_user.id,
            is_owner=is_owner
        )

    async def get_recruiter_jobs(self, current_user: User) -> List[Job]:
        """
        Retrieve all active jobs posted by the logged-in Recruiter/Owner user.
        """
        if current_user.role not in [UserRole.RECRUITER, UserRole.COMPANY_OWNER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Company Owners and Recruiters can view their posted jobs."
            )
            
        return await self.job_repo.get_recruiter_jobs(self.db, recruiter_id=current_user.id)

    async def search_jobs(self, query_str: str) -> List[Job]:
        """
        Search active OPEN job postings by keywords matching title, company name, or location.
        """
        if not query_str or not query_str.strip():
            return []
            
        return await self.job_repo.search_jobs(self.db, query_str=query_str.strip())
