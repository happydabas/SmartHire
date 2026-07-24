from fastapi import APIRouter, Depends

from app.models.users import User
from app.auth.dependencies import (
    require_job_seeker,
    require_recruiter,
    require_company_owner,
    require_admin,
)

router = APIRouter()

@router.get(
    "/job-seeker",
    summary="Access Job Seeker protected resources",
    description="Endpoint accessible only by authenticated users with the jobseeker role."
)
async def test_job_seeker(
    current_user: User = Depends(require_job_seeker)
) -> dict:
    """
    Returns success message along with user details if caller is a jobseeker.
    """
    return {
        "status": "success",
        "message": f"Welcome Job Seeker, {current_user.name}!",
        "role": current_user.role
    }


@router.get(
    "/recruiter",
    summary="Access Recruiter protected resources",
    description="Endpoint accessible only by authenticated users with the recruiter role."
)
async def test_recruiter(
    current_user: User = Depends(require_recruiter)
) -> dict:
    """
    Returns success message along with user details if caller is a recruiter.
    """
    return {
        "status": "success",
        "message": f"Welcome Recruiter, {current_user.name}!",
        "role": current_user.role
    }


@router.get(
    "/company-owner",
    summary="Access Company Owner protected resources",
    description="Endpoint accessible only by authenticated users with the company_owner role."
)
async def test_company_owner(
    current_user: User = Depends(require_company_owner)
) -> dict:
    """
    Returns success message along with user details if caller is a company_owner.
    """
    return {
        "status": "success",
        "message": f"Welcome Company Owner, {current_user.name}!",
        "role": current_user.role
    }


@router.get(
    "/admin",
    summary="Access Admin protected resources",
    description="Endpoint accessible only by authenticated users with the admin role."
)
async def test_admin(
    current_user: User = Depends(require_admin)
) -> dict:
    """
    Returns success message along with user details if caller is an admin.
    """
    return {
        "status": "success",
        "message": f"Welcome Admin, {current_user.name}!",
        "role": current_user.role
    }
