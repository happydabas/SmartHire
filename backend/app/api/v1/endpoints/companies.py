from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.schemas.companies import CompanyCreate, CompanyUpdate, CompanyResponse
from app.schemas.users import UserResponse, UserStatusUpdate
from app.schemas.jobs import JobDetailResponse
from app.schemas.company_invitations import InvitationCreate, InvitationResponse
from app.services.companies import CompanyService
from app.services.company_invitations import CompanyInvitationService
from app.services.jobs import JobService
from app.auth.dependencies import get_current_active_user

router = APIRouter()

def get_company_service(db: AsyncSession = Depends(get_db)) -> CompanyService:
    """Dependency provider injecting the CompanyService."""
    return CompanyService(db)

def get_job_service(db: AsyncSession = Depends(get_db)) -> JobService:
    """Dependency provider injecting the JobService."""
    return JobService(db)

def get_invitation_service(db: AsyncSession = Depends(get_db)) -> CompanyInvitationService:
    """Dependency provider injecting the CompanyInvitationService."""
    return CompanyInvitationService(db)


@router.post(
    "",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new company profile",
    description="Accessible by authenticated recruiters without a company or company owners."
)
async def create_company(
    company_in: CompanyCreate,
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> CompanyResponse:
    """
    Create a new company profile and associate creator as owner.
    """
    if current_user.role not in [UserRole.RECRUITER, UserRole.COMPANY_OWNER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters are authorized to create a company profile."
        )

    created_company = await company_service.create_company(
        obj_in=company_in,
        owner_id=current_user.id
    )
    return created_company

@router.get(
    "/me",
    response_model=CompanyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get caller's company profile",
    description="Returns the company associated with the authenticated user."
)
async def get_my_company(
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> CompanyResponse:
    """
    Retrieve company profile for current logged-in owner/recruiter user.
    """
    return await company_service.get_company_by_user(current_user=current_user)

@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get company profile details",
    description="Accessible by any authenticated user."
)
async def get_company(
    company_id: int,
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> CompanyResponse:
    """
    Fetch company details by primary key ID.
    """
    return await company_service.get_company(company_id=company_id)

@router.put(
    "/{company_id}",
    response_model=CompanyResponse,
    status_code=status.HTTP_200_OK,
    summary="Update company profile details",
    description="Accessible only by the Company Owner of that company."
)
async def update_company(
    company_id: int,
    company_in: CompanyUpdate,
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> CompanyResponse:
    """
    Update company profile details.
    """
    return await company_service.update_company(
        company_id=company_id,
        obj_in=company_in,
        user_id=current_user.id
    )

@router.get(
    "/{company_id}/recruiters",
    response_model=List[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List all company recruiters",
    description="Accessible only by the Company Owner of that company."
)
async def list_recruiters(
    company_id: int,
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> List[UserResponse]:
    """
    Retrieve recruiter user profiles belonging to the company.
    """
    return await company_service.get_company_recruiters(
        company_id=company_id,
        owner_id=current_user.id
    )

@router.get(
    "/{company_id}/recruiters/{recruiter_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get recruiter profile details",
    description="Accessible only by the Company Owner of that company."
)
async def get_recruiter_detail(
    company_id: int,
    recruiter_id: int,
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> UserResponse:
    """
    Fetch recruiter details if linked to this company.
    """
    return await company_service.get_company_recruiter_detail(
        company_id=company_id,
        recruiter_id=recruiter_id,
        owner_id=current_user.id
    )

@router.patch(
    "/{company_id}/recruiters/{recruiter_id}/status",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update recruiter status",
    description="Accessible only by the Company Owner of that company."
)
async def update_recruiter_status(
    company_id: int,
    recruiter_id: int,
    payload: UserStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> UserResponse:
    """
    Update recruiter active status parameter.
    """
    return await company_service.update_recruiter_status(
        company_id=company_id,
        recruiter_id=recruiter_id,
        status_in=payload.status,
        owner_id=current_user.id
    )

@router.delete(
    "/{company_id}/recruiters/{recruiter_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove recruiter from company",
    description="Accessible only by the Company Owner of that company."
)
async def remove_recruiter(
    company_id: int,
    recruiter_id: int,
    current_user: User = Depends(get_current_active_user),
    company_service: CompanyService = Depends(get_company_service)
) -> UserResponse:
    """
    Clear recruiter company association without deleting the user profile.
    """
    return await company_service.remove_recruiter(
        company_id=company_id,
        recruiter_id=recruiter_id,
        owner_id=current_user.id
    )

@router.get(
    "/{company_id}/jobs",
    response_model=List[JobDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="List all company job postings",
    description="Accessible only by the Company Owner or Recruiters of that company."
)
async def list_company_jobs(
    company_id: int,
    current_user: User = Depends(get_current_active_user),
    job_service: JobService = Depends(get_job_service)
) -> List[JobDetailResponse]:
    """
    Retrieve job postings associated with the company.
    """
    return await job_service.get_company_jobs(
        company_id=company_id,
        current_user=current_user
    )

# ==========================================
# Company Invitations Endpoints
# ==========================================

@router.post(
    "/{company_id}/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a recruiter invitation",
    description="Accessible only by the Company Owner. Sends an invitation to a recruiter email."
)
async def create_invitation(
    company_id: int,
    payload: InvitationCreate,
    current_user: User = Depends(get_current_active_user),
    invitation_service: CompanyInvitationService = Depends(get_invitation_service)
) -> InvitationResponse:
    """
    Generate and send a recruiter invitation link.
    """
    return await invitation_service.create_invitation(
        company_id=company_id,
        recruiter_email=payload.recruiter_email,
        owner_id=current_user.id
    )

@router.get(
    "/{company_id}/invitations",
    response_model=List[InvitationResponse],
    status_code=status.HTTP_200_OK,
    summary="List company invitations",
    description="Accessible only by the Company Owner. Returns list of invitations sent by the company."
)
async def list_invitations(
    company_id: int,
    current_user: User = Depends(get_current_active_user),
    invitation_service: CompanyInvitationService = Depends(get_invitation_service)
) -> List[InvitationResponse]:
    """
    Retrieve all invitations for the company.
    """
    return await invitation_service.list_company_invitations(
        company_id=company_id,
        owner_id=current_user.id
    )

@router.delete(
    "/{company_id}/invitations/{invitation_id}",
    response_model=InvitationResponse,
    status_code=status.HTTP_200_OK,
    summary="Cancel a pending invitation",
    description="Accessible only by the Company Owner."
)
async def cancel_invitation(
    company_id: int,
    invitation_id: int,
    current_user: User = Depends(get_current_active_user),
    invitation_service: CompanyInvitationService = Depends(get_invitation_service)
) -> InvitationResponse:
    """
    Cancel a pending recruiter invitation.
    """
    return await invitation_service.cancel_invitation(
        company_id=company_id,
        invitation_id=invitation_id,
        owner_id=current_user.id
    )
