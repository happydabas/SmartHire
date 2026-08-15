from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.applications import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    ApplicationDetailResponse,
    ApplicationHistoryResponse,
    ApplicationWithdrawResponse
)
from app.services.applications import ApplicationService
from app.auth.dependencies import get_current_active_user

router = APIRouter()

def get_application_service(db: AsyncSession = Depends(get_db)) -> ApplicationService:
    """Dependency provider injecting the ApplicationService."""
    return ApplicationService(db)


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new job application",
    description="Accessible only by authenticated Job Seekers. Submits an application for a job."
)
async def create_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
) -> ApplicationResponse:
    """
    Apply for a job posting.
    """
    return await service.apply_to_job(obj_in=payload, current_user=current_user)


@router.get(
    "/history",
    response_model=ApplicationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve application history",
    description="Retrieve paginated application history for the authenticated Job Seeker."
)
async def get_application_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
) -> ApplicationHistoryResponse:
    """
    Retrieve application history.
    """
    items, total = await service.get_user_application_history(
        current_user,
        page=page,
        limit=limit
    )
    
    # Structure details to align with ApplicationHistoryResponse
    structured_items = []
    for app_record in items:
        company_name = "Unknown Company"
        if app_record.job and app_record.job.company:
            company_name = app_record.job.company.name

        structured_items.append({
            "id": app_record.id,
            "status": app_record.status,
            "applied_at": app_record.applied_at,
            "updated_at": app_record.updated_at,
            "job": {
                "id": app_record.job.id if app_record.job else 0,
                "title": app_record.job.title if app_record.job else "Unknown Job",
                "company_name": company_name,
                "location": app_record.job.location if app_record.job else "Unknown Location",
                "job_type": app_record.job.job_type.value if app_record.job and hasattr(app_record.job.job_type, "value") else (app_record.job.job_type if app_record.job else "unknown")
            }
        })

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": structured_items
    }


@router.get(
    "/company",
    status_code=status.HTTP_200_OK,
    summary="Retrieve company applications",
    description="Retrieve paginated applications for the logged-in recruiter's company. Owner sees all company applications; normal recruiters see applications for assigned jobs only."
)
async def get_company_applications(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
):
    """
    Retrieve company applications based on recruiter assignment.
    """
    items, total = await service.get_company_applications(
        current_user,
        page=page,
        limit=limit
    )
    
    structured_items = []
    for app_record in items:
        company_name = "Unknown Company"
        if app_record.job and app_record.job.company:
            company_name = app_record.job.company.name

        structured_items.append({
            "id": app_record.id,
            "status": app_record.status,
            "applied_at": app_record.applied_at,
            "created_at": app_record.created_at,
            "updated_at": app_record.updated_at,
            "job": {
                "id": app_record.job.id if app_record.job else 0,
                "title": app_record.job.title if app_record.job else "Unknown Job",
                "company_name": company_name,
                "location": app_record.job.location if app_record.job else "Unknown Location",
                "job_type": app_record.job.job_type.value if app_record.job and hasattr(app_record.job.job_type, "value") else (app_record.job.job_type if app_record.job else "unknown")
            },
            "candidate": {
                "id": app_record.user.id if app_record.user else 0,
                "name": (app_record.user.profile.full_name if app_record.user and app_record.user.profile and app_record.user.profile.full_name else (app_record.user.name if app_record.user else "Unknown Candidate")),
                "full_name": (app_record.user.profile.full_name if app_record.user and app_record.user.profile and app_record.user.profile.full_name else (app_record.user.name if app_record.user else "Unknown Candidate")),
                "email": app_record.user.email if app_record.user else "",
                "profile": app_record.user.profile if app_record.user else None
            },
            "resume": {
                "id": (app_record.resume or getattr(app_record.user, "resume", None)).id,
                "file_name": (app_record.resume or getattr(app_record.user, "resume", None)).file_name or "resume.pdf",
                "resume_file_name": (app_record.resume or getattr(app_record.user, "resume", None)).file_name or "resume.pdf",
                "file_path": f"/api/v1/applications/{app_record.id}/resume",
                "resume_url_or_path": f"/api/v1/applications/{app_record.id}/resume"
            } if (app_record.resume or getattr(app_record.user, "resume", None)) else None
        })

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": structured_items
    }


@router.get(
    "/{application_id}",
    response_model=ApplicationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve application details",
    description="Retrieve application details including job, candidate, and resume info."
)
async def get_application_details(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
) -> ApplicationDetailResponse:
    """
    Retrieve application details.
    """
    app_record = await service.get_application_details(application_id=application_id, current_user=current_user)
    
    resume_obj = app_record.resume
    if not resume_obj and app_record.user_id:
        from app.repositories.resumes import ResumeRepository
        resume_obj = await ResumeRepository().get_by_user_id(service.db, user_id=app_record.user_id)

    # Structure details to align with ApplicationDetailResponse
    return {
        "id": app_record.id,
        "status": app_record.status,
        "applied_at": app_record.applied_at,
        "created_at": app_record.created_at,
        "updated_at": app_record.updated_at,
        "job": {
            "id": app_record.job.id,
            "title": app_record.job.title,
            "description": app_record.job.description,
            "company_name": app_record.job.company.name if app_record.job.company else "Unknown Company",
            "location": app_record.job.location,
            "job_type": app_record.job.job_type.value if hasattr(app_record.job.job_type, "value") else app_record.job.job_type
        },
        "candidate": {
            "id": app_record.user.id if app_record.user else 0,
            "name": (app_record.user.profile.full_name if app_record.user and app_record.user.profile and app_record.user.profile.full_name else (app_record.user.name if app_record.user else "Unknown Candidate")),
            "email": app_record.user.email if app_record.user else "",
            "profile": app_record.user.profile if app_record.user else None
        },
        "resume": {
            "id": resume_obj.id,
            "file_name": resume_obj.file_name or "resume.pdf",
            "resume_file_name": resume_obj.file_name or "resume.pdf",
            "file_path": f"/api/v1/applications/{app_record.id}/resume",
            "resume_url_or_path": f"/api/v1/applications/{app_record.id}/resume"
        } if resume_obj else None
    }


@router.get(
    "/{application_id}/resume",
    status_code=status.HTTP_200_OK,
    summary="View or download candidate application resume PDF",
    description="Streams the candidate's resume PDF file for an application."
)
async def get_application_resume_file(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
):
    """
    Stream the candidate's resume PDF for an application.
    Accessible by JobSeeker owner, Recruiter, Company Owner, or Admin.
    """
    import os
    from fastapi.responses import FileResponse
    from fastapi import HTTPException

    app_record = await service.get_application_details(application_id=application_id, current_user=current_user)
    
    resume_obj = app_record.resume
    if not resume_obj and app_record.user_id:
        from app.repositories.resumes import ResumeRepository
        resume_obj = await ResumeRepository().get_by_user_id(service.db, user_id=app_record.user_id)

    if not resume_obj or not resume_obj.file_path or not os.path.exists(resume_obj.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume file associated with this candidate profile or file missing on disk."
        )

    return FileResponse(
        path=resume_obj.file_path,
        media_type="application/pdf",
        filename=resume_obj.file_name or "resume.pdf",
        headers={
            "Content-Disposition": f'inline; filename="{resume_obj.file_name or "resume.pdf"}"'
        }
    )


@router.patch(
    "/{application_id}/status",
    response_model=ApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Update job application status",
    description="Accessible by Company Owners and Recruiters assigned to the job."
)
async def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
) -> ApplicationResponse:
    """
    Update status of a job application.
    """
    return await service.update_application_status(
        application_id=application_id,
        new_status=payload.status,
        current_user=current_user
    )


@router.delete(
    "/{application_id}",
    response_model=ApplicationWithdrawResponse,
    status_code=status.HTTP_200_OK,
    summary="Withdraw a job application",
    description="Accessible only by the authenticated Job Seeker who submitted the application."
)
async def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    service: ApplicationService = Depends(get_application_service)
) -> ApplicationWithdrawResponse:
    """
    Withdraw a submitted job application.
    """
    app_record = await service.withdraw_application(application_id=application_id, current_user=current_user)
    return {
        "message": "Application withdrawn successfully",
        "application_id": app_record.id,
        "status": app_record.status
    }
