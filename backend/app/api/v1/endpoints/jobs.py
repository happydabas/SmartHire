from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.schemas.jobs import JobCreate, JobUpdate, JobResponse, JobDetailResponse, JobPaginatedResponse
from app.services.jobs import JobService
from app.auth.dependencies import get_current_active_user

router = APIRouter()

def get_job_service(db: AsyncSession = Depends(get_db)) -> JobService:
    """Dependency provider injecting the JobService."""
    return JobService(db)

@router.get(
    "",
    response_model=JobPaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="List all open jobs (Paginated)",
    description="Returns active OPEN job postings in a paginated payload. Excludes DRAFT, CLOSED, and DELETED listings. Supports dynamic query filtering parameters."
)
async def list_open_jobs(
    page: int = Query(1, ge=1, description="Current page index"),
    limit: int = Query(10, ge=1, le=100, description="Page size limit"),
    company_id: Optional[int] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    employment_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    min_salary: Optional[Decimal] = None,
    max_salary: Optional[Decimal] = None,
    skills: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobPaginatedResponse:
    """
    Retrieve paginated active open job postings list with optional filters.
    """
    return await job_service.get_open_jobs_paginated(
        page=page,
        limit=limit,
        company_id=company_id,
        location=location,
        work_mode=work_mode,
        employment_type=employment_type,
        experience_level=experience_level,
        min_salary=min_salary,
        max_salary=max_salary,
        skills=skills
    )

@router.get(
    "/search",
    response_model=List[JobDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Search open job listings",
    description="Search active OPEN job postings by title, company name, or location. Case-insensitive and partial match query."
)
async def search_jobs(
    q: str = "",
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> List[JobDetailResponse]:
    """
    Search active open job postings.
    """
    return await job_service.search_jobs(query_str=q)

@router.get(
    "/drafts",
    response_model=List[JobResponse],
    status_code=status.HTTP_200_OK,
    summary="List all company draft jobs",
    description="Accessible only by authenticated Company Owners and Recruiters. Lists draft listings belonging to the user's company."
)
async def list_drafts(
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> List[JobResponse]:
    """
    Retrieve draft job postings list for the company.
    """
    if current_user.role not in [UserRole.COMPANY_OWNER, UserRole.RECRUITER]:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Company Owners and Recruiters are authorized to view company draft job postings."
        )
        
    return await job_service.get_draft_jobs(current_user=current_user)

@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new job listing",
    description="Accessible only by authenticated Company Owners and Recruiters. Automatically associates the posting with the user's company and links required skills and pipelines."
)
async def create_job(
    payload: JobCreate,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobResponse:
    """
    Create a new job posting listing.
    """
    if current_user.role not in [UserRole.COMPANY_OWNER, UserRole.RECRUITER]:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Company Owners and Recruiters are authorized to create job postings."
        )
        
    created_job = await job_service.create_job(
        obj_in=payload,
        current_user=current_user
    )
    return created_job

@router.put(
    "/{job_id}",
    response_model=JobResponse,
    status_code=status.HTTP_200_OK,
    summary="Edit an existing job posting",
    description="Accessible only by the creator (Recruiter) of the job listing or the Company Owner of that company. Completely modifies posting parameters."
)
async def update_job(
    job_id: int,
    payload: JobUpdate,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobResponse:
    """
    Update details of an existing job posting.
    """
    return await job_service.update_job(
        job_id=job_id,
        obj_in=payload,
        current_user=current_user
    )

@router.delete(
    "/{job_id}",
    response_model=JobResponse,
    status_code=status.HTTP_200_OK,
    summary="Soft-delete a job posting",
    description="Accessible only by the creator (Recruiter) of the job listing or the Company Owner of that company. Flags the listing as deleted."
)
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobResponse:
    """
    Soft-delete a job posting by primary key ID.
    """
    return await job_service.delete_job(
        job_id=job_id,
        current_user=current_user
    )

@router.patch(
    "/{job_id}/close",
    response_model=JobResponse,
    status_code=status.HTTP_200_OK,
    summary="Close a job posting",
    description="Accessible only by the creator (Recruiter) of the job listing or the Company Owner of that company. Sets status to CLOSED."
)
async def close_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobResponse:
    """
    Close a job posting by setting status parameter to CLOSED.
    """
    return await job_service.close_job(
        job_id=job_id,
        current_user=current_user
    )

@router.patch(
    "/{job_id}/publish",
    response_model=JobResponse,
    status_code=status.HTTP_200_OK,
    summary="Publish a draft job posting",
    description="Accessible only by the creator (Recruiter) of the job listing or the Company Owner of that company. Toggles status from DRAFT to OPEN."
)
async def publish_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobResponse:
    """
    Publish a draft job listing, changing status parameter to OPEN.
    """
    return await job_service.publish_job(
        job_id=job_id,
        current_user=current_user
    )
