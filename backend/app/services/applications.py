from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.applications import ApplicationRepository
from app.repositories.jobs import JobRepository
from app.repositories.resumes import ResumeRepository
from app.models.applications import Application, ApplicationStatus
from app.models.users import User, UserRole

# Centralized application status transition rules
ALLOWED_TRANSITIONS = {
    ApplicationStatus.APPLIED: {ApplicationStatus.SCREENING, ApplicationStatus.WITHDRAWN},
    ApplicationStatus.SCREENING: {ApplicationStatus.INTERVIEW, ApplicationStatus.WITHDRAWN},
    ApplicationStatus.INTERVIEW: {ApplicationStatus.SELECTED, ApplicationStatus.REJECTED},
    ApplicationStatus.SELECTED: set(),
    ApplicationStatus.REJECTED: set(),
    ApplicationStatus.WITHDRAWN: set()
}
from app.schemas.applications import ApplicationCreate

class ApplicationService:
    """
    Handles business logic for candidate job applications.
    Enforces role constraints, job existence checks, duplicate guards,
    and handles automatic resume linkage.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.app_repo = ApplicationRepository()
        self.job_repo = JobRepository()
        self.resume_repo = ResumeRepository()

    async def apply_to_job(self, obj_in: ApplicationCreate, current_user: User) -> Application:
        """
        Create a new job application for the logged-in user.
        """
        # 1. Enforce Role constraint (Only JOB_SEEKER can apply)
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to apply for jobs."
            )

        # 2. Check if the job exists (excludes soft-deleted jobs)
        job = await self.job_repo.get_by_id(self.db, job_id=obj_in.job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found."
            )

        # 3. Check job status (only OPEN is allowed, DRAFT/CLOSED are rejected)
        from app.models.jobs import JobStatus
        if job.status != JobStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot apply: Job is not open."
            )

        # 4. Check job application deadline (Expired check)
        from datetime import datetime, timezone
        if job.application_deadline:
            deadline_naive = job.application_deadline.replace(tzinfo=None)
            now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
            if deadline_naive < now_naive:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot apply: Job has expired."
                )

        # 5. Company/Job ownership validation
        if not job.company_id or not job.company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot apply: Job is not associated with a valid company."
            )

        # 6. Profile Completion Validation
        if not current_user.profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complete your profile before applying"
            )

        # 7. Resume Validation
        if not current_user.resume or not current_user.resume.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid resume is required before applying for a job."
            )

        # 8. Check if user already applied to this job (prevent duplicates)
        existing = await self.app_repo.check_existing_application(
            self.db, user_id=current_user.id, job_id=obj_in.job_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already applied for this job"
            )

        # 9. Create application record
        from sqlalchemy.exc import IntegrityError
        try:
            return await self.app_repo.create_application(
                self.db,
                user_id=current_user.id,
                job_id=obj_in.job_id,
                resume_id=current_user.resume.id
            )
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already applied for this job"
            )

    async def get_user_applications(self, current_user: User) -> List[Application]:
        """
        Retrieve all applications submitted by the current job seeker.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can retrieve their job applications."
            )
        return await self.app_repo.get_user_applications(self.db, user_id=current_user.id)

    async def get_application_by_id(self, application_id: int, current_user: User) -> Application:
        """
        Retrieve an application by its ID (with ownership checks).
        """
        app_record = await self.app_repo.get_application_by_id(self.db, application_id=application_id)
        if not app_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found."
            )

        # Ensure ownership
        if app_record.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this application record."
            )
        return app_record

    async def get_application_details(self, application_id: int, current_user: User) -> Application:
        """
        Retrieve complete details of a specific job application with role-based checks.
        """
        app_record = await self.app_repo.get_application_by_id(self.db, application_id=application_id)
        if not app_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found."
            )

        # Enforce Authorization Matrix
        if current_user.role == UserRole.JOBSEEKER:
            if app_record.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this application record."
                )
        elif current_user.role == UserRole.RECRUITER:
            if not current_user.company_id or app_record.job.company_id != current_user.company_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Job does not belong to your company."
                )
        elif current_user.role == UserRole.COMPANY_OWNER:
            if not app_record.job.company or app_record.job.company.owner_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You do not own the company hosting this job."
                )
        elif current_user.role == UserRole.ADMIN:
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Invalid user role."
            )

        return app_record

    async def get_user_application_history(
        self,
        current_user: User,
        *,
        page: int = 1,
        limit: int = 10
    ) -> tuple[List[Application], int]:
        """
        Retrieve paginated application history for a Job Seeker.
        """
        # Role constraint check
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to view application history."
            )

        skip = (page - 1) * limit
        return await self.app_repo.get_user_application_history(self.db, user_id=current_user.id, skip=skip, limit=limit)

    async def withdraw_application(self, application_id: int, current_user: User) -> Application:
        """
        Withdraw a submitted application.
        """
        return await self.update_application_status(
            application_id=application_id,
            new_status=ApplicationStatus.WITHDRAWN,
            current_user=current_user
        )

    async def update_application_status(
        self,
        application_id: int,
        new_status: ApplicationStatus,
        current_user: User
    ) -> Application:
        """
        Update application status with validation and state transition checks.
        """
        # Fetch the application
        app_record = await self.app_repo.get_application_by_id(self.db, application_id=application_id)
        if not app_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found."
            )

        # Authorization check
        if current_user.role == UserRole.JOBSEEKER:
            # Job seeker can only withdraw their own application
            if app_record.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this application record."
                )
            if new_status != ApplicationStatus.WITHDRAWN:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Job Seekers are only allowed to withdraw applications."
                )
        elif current_user.role in [UserRole.RECRUITER, UserRole.COMPANY_OWNER]:
            # Recruiter/Owner can update status for jobs belonging to their company
            if current_user.role == UserRole.RECRUITER:
                if not current_user.company_id or app_record.job.company_id != current_user.company_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: Job does not belong to your company."
                    )
            elif current_user.role == UserRole.COMPANY_OWNER:
                if not app_record.job.company or app_record.job.company.owner_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: You do not own the company hosting this job."
                    )
        elif current_user.role == UserRole.ADMIN:
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Invalid user role."
            )

        # Transition rules validation
        old_status = ApplicationStatus(app_record.status)
        new_status = ApplicationStatus(new_status)

        if old_status == ApplicationStatus.WITHDRAWN and new_status == ApplicationStatus.WITHDRAWN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application already withdrawn"
            )

        if old_status == new_status:
            return app_record

        # Check allowed transitions
        allowed = ALLOWED_TRANSITIONS.get(old_status, set())
        if new_status not in allowed:
            if new_status == ApplicationStatus.WITHDRAWN:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot withdraw application in status: {old_status.value}"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from {old_status.value} to {new_status.value}."
            )

        # Update
        updated_app = await self.app_repo.update_application_status(self.db, application_id=application_id, status=new_status)
        if not updated_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found."
            )
        return updated_app

    async def get_job_applications(
        self,
        job_id: int,
        current_user: User,
        *,
        page: int = 1,
        limit: int = 10
    ) -> tuple[List[Application], int]:
        """
        Retrieve paginated applications for a job posting.
        """
        # Role constraint check
        if current_user.role not in [UserRole.RECRUITER, UserRole.COMPANY_OWNER, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only Recruiters and Company Owners can view job applications."
            )

        # Retrieve job posting
        job = await self.job_repo.get_by_id(self.db, job_id=job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found."
            )

        # Verify company ownership
        if current_user.role == UserRole.RECRUITER:
            if not current_user.company_id or job.company_id != current_user.company_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Job does not belong to your company."
                )
        elif current_user.role == UserRole.COMPANY_OWNER:
            if not job.company or job.company.owner_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You do not own the company hosting this job."
                )
        elif current_user.role == UserRole.ADMIN:
            pass

        skip = (page - 1) * limit
        return await self.app_repo.get_job_applications(self.db, job_id=job_id, skip=skip, limit=limit)
