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
        candidate_info = {
            "id": app_record.user.id,
            "name": app_record.user.name,
            "email": app_record.user.email,
            "profile": app_record.user.profile
        }

        # Resume details
        resume_info = None
        if app_record.resume:
            resume_info = {
                "id": app_record.resume.id,
                "resume_file_name": app_record.resume.file_name,
                "resume_url_or_path": app_record.resume.file_path
            }

        # Job details
        job_info = {
            "id": app_record.job.id,
            "title": app_record.job.title
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
