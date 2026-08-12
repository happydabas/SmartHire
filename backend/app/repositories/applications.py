from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.applications import Application, ApplicationStatus

class ApplicationRepository:
    """
    Handles PostgreSQL database operations for the Application model.
    """

    async def create_application(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        job_id: int,
        resume_id: Optional[int] = None
    ) -> Application:
        """Create and persist a new job application."""
        db_obj = Application(
            user_id=user_id,
            job_id=job_id,
            resume_id=resume_id,
            status="APPLIED"
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_application_by_id(self, db: AsyncSession, application_id: int) -> Optional[Application]:
        """Retrieve an application by its ID with joined loads for authorization and response building."""
        from sqlalchemy.orm import joinedload
        from app.models.jobs import Job
        from app.models.users import User

        stmt = select(Application).options(
            joinedload(Application.job).joinedload(Job.company),
            joinedload(Application.user).joinedload(User.profile),
            joinedload(Application.resume)
        ).where(Application.id == application_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_user_applications(self, db: AsyncSession, user_id: int) -> List[Application]:
        """Retrieve all applications submitted by a specific user."""
        stmt = select(Application).where(Application.user_id == user_id).order_by(Application.applied_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def check_existing_application(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        job_id: int
    ) -> Optional[Application]:
        """Check if an application already exists for the user and job."""
        stmt = select(Application).where(
            Application.user_id == user_id,
            Application.job_id == job_id
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_user_application_history(
        self,
        db: AsyncSession,
        user_id: int,
        *,
        skip: int = 0,
        limit: int = 10
    ) -> tuple[List[Application], int]:
        """
        Fetch applications for user_id with joined load on job and company,
        sorted by created_at DESC with pagination.
        Returns a tuple of (list of applications, total count).
        """
        from sqlalchemy import func
        from sqlalchemy.orm import joinedload
        from app.models.jobs import Job

        # Get total count first
        count_stmt = select(func.count()).select_from(Application).where(Application.user_id == user_id)
        count_result = await db.execute(count_stmt)
        total = count_result.scalar() or 0

        # Get records with N+1 avoidance
        stmt = (
            select(Application)
            .where(Application.user_id == user_id)
            .options(
                joinedload(Application.job).joinedload(Job.company)
            )
            .order_by(Application.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        items = list(result.scalars().all())
        
        return items, total

    async def withdraw_application(
        self,
        db: AsyncSession,
        application: Application
    ) -> Application:
        """Update status to WITHDRAWN and persist."""
        application.status = ApplicationStatus.WITHDRAWN
        db.add(application)
        await db.commit()
        await db.refresh(application)
        return application

    async def get_job_applications(
        self,
        db: AsyncSession,
        job_id: int,
        *,
        skip: int = 0,
        limit: int = 10
    ) -> tuple[List[Application], int]:
        """
        Fetch applications for a job_id with joined load on user, profile, resume, and job.
        Sorted by created_at DESC with pagination.
        Returns a tuple of (list of applications, total count).
        """
        from sqlalchemy import func
        from sqlalchemy.orm import joinedload
        from app.models.users import User

        # Get total count first
        count_stmt = select(func.count()).select_from(Application).where(Application.job_id == job_id)
        count_result = await db.execute(count_stmt)
        total = count_result.scalar() or 0

        # Get records with N+1 avoidance
        stmt = (
            select(Application)
            .where(Application.job_id == job_id)
            .options(
                joinedload(Application.user).joinedload(User.profile),
                joinedload(Application.resume),
                joinedload(Application.job)
            )
            .order_by(Application.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        items = list(result.scalars().all())
        
        return items, total

    async def get_company_applications_for_user(
        self,
        db: AsyncSession,
        company_id: int,
        user_id: int,
        is_owner: bool,
        *,
        skip: int = 0,
        limit: int = 10
    ) -> tuple[List[Application], int]:
        """
        Fetch applications for a company based on recruiter permissions:
        - Company Owner: receives applications for all company jobs.
        - Normal Recruiter: receives applications ONLY for jobs assigned to them in job_recruiters.
        """
        from sqlalchemy import func
        from sqlalchemy.orm import joinedload
        from app.models.jobs import Job
        from app.models.users import User
        from app.models.job_recruiters import JobRecruiter

        if is_owner:
            base_stmt = (
                select(Application)
                .join(Job, Application.job_id == Job.id)
                .where(Job.company_id == company_id, Job.is_deleted == False)
            )
        else:
            base_stmt = (
                select(Application)
                .join(Job, Application.job_id == Job.id)
                .join(JobRecruiter, Job.id == JobRecruiter.job_id)
                .where(
                    Job.company_id == company_id,
                    JobRecruiter.recruiter_id == user_id,
                    Job.is_deleted == False
                )
                .distinct()
            )

        subq = base_stmt.subquery()
        count_stmt = select(func.count()).select_from(subq)
        count_result = await db.execute(count_stmt)
        total = count_result.scalar() or 0

        results_stmt = (
            base_stmt
            .options(
                joinedload(Application.user).joinedload(User.profile),
                joinedload(Application.resume),
                joinedload(Application.job)
            )
            .order_by(Application.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        results_result = await db.execute(results_stmt)
        items = list(results_result.scalars().all())

        return items, total

    async def update_application_status(
        self,
        db: AsyncSession,
        application_id: int,
        status: ApplicationStatus
    ) -> Optional[Application]:
        """Fetch, update status, and persist application."""
        stmt = select(Application).where(Application.id == application_id)
        result = await db.execute(stmt)
        application = result.scalars().first()
        if not application:
            return None
        application.status = status
        db.add(application)
        await db.commit()
        await db.refresh(application)
        return application
