from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.company_invitations import InvitationDetailResponse, InvitationAcceptRequest
from app.schemas.auth import TokenResponse
from app.services.company_invitations import CompanyInvitationService
from app.auth.security import oauth2_scheme_optional
from app.auth.dependencies import verify_access_token
from app.repositories.users import UserRepository

router = APIRouter()
user_repo = UserRepository()

def get_invitation_service(db: AsyncSession = Depends(get_db)) -> CompanyInvitationService:
    """Dependency provider injecting CompanyInvitationService."""
    return CompanyInvitationService(db)

@router.get(
    "/{token}",
    response_model=InvitationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get invitation details by token",
    description="Public endpoint to inspect company invitation details before accepting."
)
async def get_invitation_detail(
    token: str,
    service: CompanyInvitationService = Depends(get_invitation_service)
) -> InvitationDetailResponse:
    """
    Fetch public invitation information.
    """
    return await service.get_invitation_details(token=token)

@router.post(
    "/accept",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept recruiter invitation",
    description="Validates token and accepts invitation for new or existing recruiter account."
)
async def accept_invitation(
    payload: InvitationAcceptRequest,
    db: AsyncSession = Depends(get_db),
    service: CompanyInvitationService = Depends(get_invitation_service),
    token_str: Optional[str] = Depends(oauth2_scheme_optional)
) -> TokenResponse:
    """
    Accept invitation and log in user.
    """
    current_user = None
    if token_str:
        try:
            token_claims = verify_access_token(token_str)
            user_id = int(token_claims.get("sub"))
            current_user = await user_repo.get_by_id(db, user_id=user_id)
        except Exception:
            current_user = None

    return await service.accept_invitation(
        token=payload.token,
        name=payload.name,
        password=payload.password,
        current_user=current_user
    )
