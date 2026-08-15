from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.applications import RecruiterApplicationsResponse
from app.services.applications import ApplicationService
from app.auth.dependencies import get_current_active_user

router = APIRouter()

def get_application_service(db: AsyncSession = Depends(get_db)) -> ApplicationService:
    """Dependency provider injecting the ApplicationService."""
    return ApplicationService(db)


@router.get(
    "/jobs/{job_id}/applications",
    response_model=RecruiterApplicationsResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve applications for a job posting",
    description="Accessible by Recruiters and Company Owners associated with the company hosting the job."
)
async def get_job_applications(
    job_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
) -> RecruiterApplicationsResponse:
    """
    Retrieve job applications.
    """
    items, total = await service.get_job_applications(
        job_id=job_id,
        current_user=current_user,
        page=page,
        limit=limit
    )

    # Structure details to align with RecruiterApplicationsResponse
    structured_items = []
    for app_record in items:
        # User (Candidate) details
        candidate_name = (app_record.user.profile.full_name if app_record.user and app_record.user.profile and app_record.user.profile.full_name else (app_record.user.name if app_record.user else "Candidate"))
        candidate_info = {
            "id": app_record.user.id if app_record.user else 0,
            "name": candidate_name,
            "full_name": candidate_name,
            "email": app_record.user.email if app_record.user else "",
            "profile": app_record.user.profile if app_record.user else None
        }

        # Resume details
        resume_info = None
        resume_obj = app_record.resume
        if not resume_obj and app_record.user_id:
            from app.repositories.resumes import ResumeRepository
            resume_obj = await ResumeRepository().get_by_user_id(service.db, user_id=app_record.user_id)

        if resume_obj:
            resume_info = {
                "id": resume_obj.id,
                "file_name": resume_obj.file_name or "resume.pdf",
                "resume_file_name": resume_obj.file_name or "resume.pdf",
                "file_path": f"/api/v1/applications/{app_record.id}/resume",
                "resume_url_or_path": f"/api/v1/applications/{app_record.id}/resume"
            }

        # Job details
        job_info = {
            "id": app_record.job.id if app_record.job else 0,
            "title": app_record.job.title if app_record.job else "Job Listing",
            "job_type": app_record.job.job_type.value if app_record.job and hasattr(app_record.job.job_type, "value") else (app_record.job.job_type if app_record.job else "full-time"),
            "work_mode": app_record.job.work_mode.value if app_record.job and hasattr(app_record.job.work_mode, "value") else (app_record.job.work_mode if app_record.job else "remote"),
            "location": app_record.job.location if app_record.job else ""
        }

        structured_items.append({
            "id": app_record.id,
            "status": app_record.status,
            "applied_at": app_record.applied_at,
            "created_at": app_record.created_at,
            "candidate": candidate_info,
            "resume": resume_info,
            "job": job_info
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": structured_items
    }
