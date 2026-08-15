from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.schemas.jobs import (
    JobCreate,
    JobUpdate,
    JobResponse,
    JobDetailResponse,
    JobPaginatedResponse,
    JobAssignmentsUpdate
)
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
    sort: Optional[str] = Query("latest", description="Sort order parameter (latest, oldest, salary_desc, salary_asc, company_asc, company_desc, title_asc, title_desc)"),
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
        skills=skills,
        sort=sort
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
    description="Accessible by authenticated Recruiters and Company Owners."
)
async def create_job(
    payload: JobCreate,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobResponse:
    """
    Create a new job posting listing.
    """
    company_id = await job_service.get_user_company_id(current_user)
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must create or belong to a company before creating job postings."
        )

    is_authorized = bool(
        current_user.is_owner or 
        current_user.role in [UserRole.COMPANY_OWNER, UserRole.RECRUITER]
    )
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authorized Recruiters and Company Owners can create job postings."
        )
        
    created_job = await job_service.create_job(
        obj_in=payload,
        current_user=current_user
    )
    return created_job


@router.get(
    "/{job_id}",
    response_model=JobDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get job posting details by ID",
    description="Fetches detailed information for a specific job listing. For recruiters, verifies access authorization."
)
async def get_job_by_id(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> JobDetailResponse:
    """
    Retrieve job details by ID while validating authorization for recruiter users.
    """
    if current_user.role in [UserRole.RECRUITER, UserRole.COMPANY_OWNER]:
        return await job_service.get_job_for_user(job_id=job_id, current_user=current_user)
    return await job_service.get_job(job_id=job_id)

@router.put(
    "/{job_id}/assignments",
    response_model=List[int],
    status_code=status.HTTP_200_OK,
    summary="Manage recruiter assignments for a job",
    description="Accessible only by the Company Owner. Assigns or unassigns recruiters to manage a specific job listing."
)
async def update_job_assignments(
    job_id: int,
    payload: JobAssignmentsUpdate,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> List[int]:
    """
    Update assigned recruiter IDs for a job.
    """
    return await job_service.update_job_assignments(
        job_id=job_id,
        recruiter_ids=payload.recruiter_ids,
        current_user=current_user
    )

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
