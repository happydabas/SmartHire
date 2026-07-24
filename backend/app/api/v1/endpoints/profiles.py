from typing import List
from fastapi import APIRouter, Depends, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.profiles import ProfileCreate, ProfileUpdate, ProfileResponse
from app.schemas.resumes import ResumeMetadataResponse
from app.schemas.education import EducationCreate, EducationUpdate, EducationResponse
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.schemas.skills import SkillsAdd, SkillResponse
from app.services.profiles import ProfileService
from app.services.resumes import ResumeService
from app.services.education import EducationService
from app.services.experience import ExperienceService
from app.services.skills import SkillService
from app.auth.dependencies import get_current_active_user

router = APIRouter()

def get_profile_service(db: AsyncSession = Depends(get_db)) -> ProfileService:
    """Dependency provider injecting the ProfileService."""
    return ProfileService(db)

def get_resume_service(db: AsyncSession = Depends(get_db)) -> ResumeService:
    """Dependency provider injecting the ResumeService."""
    return ResumeService(db)

def get_education_service(db: AsyncSession = Depends(get_db)) -> EducationService:
    """Dependency provider injecting the EducationService."""
    return EducationService(db)

def get_experience_service(db: AsyncSession = Depends(get_db)) -> ExperienceService:
    """Dependency provider injecting the ExperienceService."""
    return ExperienceService(db)

def get_skill_service(db: AsyncSession = Depends(get_db)) -> SkillService:
    """Dependency provider injecting the SkillService."""
    return SkillService(db)


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create job seeker profile",
    description="Accessible only by authenticated Job Seekers. Creates a single profile record."
)
async def create_profile(
    payload: ProfileCreate,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service)
) -> ProfileResponse:
    """
    Create a new Job Seeker profile.
    """
    return await profile_service.create_profile(
        obj_in=payload,
        current_user=current_user
    )

@router.get(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get job seeker profile",
    description="Accessible only by authenticated Job Seekers. Retrieves the user's profile record."
)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service)
) -> ProfileResponse:
    """
    Retrieve Job Seeker profile details.
    """
    return await profile_service.get_profile(
        current_user=current_user
    )

@router.put(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update job seeker profile",
    description="Accessible only by authenticated Job Seekers. Updates details of the user's profile."
)
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    profile_service: ProfileService = Depends(get_profile_service)
) -> ProfileResponse:
    """
    Update Job Seeker profile details.
    """
    return await profile_service.update_profile(
        obj_in=payload,
        current_user=current_user
    )

@router.post(
    "/resume",
    response_model=ResumeMetadataResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload resume file",
    description="Accessible only by authenticated Job Seekers. Accepts PDF files only. Replaces any previous resume."
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
) -> ResumeMetadataResponse:
    """
    Upload a new resume PDF file.
    """
    return await resume_service.upload_resume(
        file=file,
        current_user=current_user
    )

@router.get(
    "/resume",
    response_model=ResumeMetadataResponse,
    status_code=status.HTTP_200_OK,
    summary="Get resume metadata",
    description="Accessible only by authenticated Job Seekers. Returns file details without downloading the file itself."
)
async def get_resume_metadata(
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
) -> ResumeMetadataResponse:
    """
    Fetch resume metadata.
    """
    return await resume_service.get_resume_metadata(
        current_user=current_user
    )

@router.put(
    "/resume",
    response_model=ResumeMetadataResponse,
    status_code=status.HTTP_200_OK,
    summary="Update resume file",
    description="Accessible only by authenticated Job Seekers. Replaces the current resume PDF file."
)
async def update_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
) -> ResumeMetadataResponse:
    """
    Replace the current resume PDF file.
    """
    return await resume_service.upload_resume(
        file=file,
        current_user=current_user
    )

@router.delete(
    "/resume",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete resume file",
    description="Accessible only by authenticated Job Seekers. Removes the file from storage and deletes the database record."
)
async def delete_resume(
    current_user: User = Depends(get_current_active_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Delete the resume file and database metadata record.
    """
    await resume_service.delete_resume(current_user=current_user)

@router.post(
    "/education",
    response_model=EducationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add education entry",
    description="Accessible only by authenticated Job Seekers. Creates a new academic qualification."
)
async def create_education(
    payload: EducationCreate,
    current_user: User = Depends(get_current_active_user),
    education_service: EducationService = Depends(get_education_service)
) -> EducationResponse:
    """
    Create a new education record.
    """
    return await education_service.create_education(
        obj_in=payload,
        current_user=current_user
    )

@router.get(
    "/education",
    response_model=List[EducationResponse],
    status_code=status.HTTP_200_OK,
    summary="List education entries",
    description="Accessible only by authenticated Job Seekers. Lists qualifications sorted by start_date descending."
)
async def list_education(
    current_user: User = Depends(get_current_active_user),
    education_service: EducationService = Depends(get_education_service)
) -> List[EducationResponse]:
    """
    List all education entries.
    """
    return await education_service.get_education_list(
        current_user=current_user
    )

@router.put(
    "/education/{education_id}",
    response_model=EducationResponse,
    status_code=status.HTTP_200_OK,
    summary="Update education entry",
    description="Accessible only by authenticated Job Seekers. Modifies details of a specific qualification."
)
async def update_education(
    education_id: int,
    payload: EducationUpdate,
    current_user: User = Depends(get_current_active_user),
    education_service: EducationService = Depends(get_education_service)
) -> EducationResponse:
    """
    Modify an existing education record.
    """
    return await education_service.update_education(
        education_id=education_id,
        obj_in=payload,
        current_user=current_user
    )

@router.delete(
    "/education/{education_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete education entry",
    description="Accessible only by authenticated Job Seekers. Removes the qualification from profile."
)
async def delete_education(
    education_id: int,
    current_user: User = Depends(get_current_active_user),
    education_service: EducationService = Depends(get_education_service)
):
    """
    Remove an existing education record.
    """
    await education_service.delete_education(
        education_id=education_id,
        current_user=current_user
    )


@router.post(
    "/experience",
    response_model=ExperienceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add experience entry",
    description="Accessible only by authenticated Job Seekers. Creates a new work experience record."
)
async def create_experience(
    payload: ExperienceCreate,
    current_user: User = Depends(get_current_active_user),
    experience_service: ExperienceService = Depends(get_experience_service)
) -> ExperienceResponse:
    """
    Create a new experience record.
    """
    return await experience_service.create_experience(
        obj_in=payload,
        current_user=current_user
    )


@router.get(
    "/experience",
    response_model=List[ExperienceResponse],
    status_code=status.HTTP_200_OK,
    summary="List experience entries",
    description="Accessible only by authenticated Job Seekers. Lists experience entries sorted by start_date descending."
)
async def list_experience(
    current_user: User = Depends(get_current_active_user),
    experience_service: ExperienceService = Depends(get_experience_service)
) -> List[ExperienceResponse]:
    """
    List all experience entries.
    """
    return await experience_service.get_experience_list(
        current_user=current_user
    )


@router.put(
    "/experience/{experience_id}",
    response_model=ExperienceResponse,
    status_code=status.HTTP_200_OK,
    summary="Update experience entry",
    description="Accessible only by authenticated Job Seekers. Modifies details of a specific experience record."
)
async def update_experience(
    experience_id: int,
    payload: ExperienceUpdate,
    current_user: User = Depends(get_current_active_user),
    experience_service: ExperienceService = Depends(get_experience_service)
) -> ExperienceResponse:
    """
    Modify an existing experience record.
    """
    return await experience_service.update_experience(
        experience_id=experience_id,
        obj_in=payload,
        current_user=current_user
    )


@router.delete(
    "/experience/{experience_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete experience entry",
    description="Accessible only by authenticated Job Seekers. Removes the experience record."
)
async def delete_experience(
    experience_id: int,
    current_user: User = Depends(get_current_active_user),
    experience_service: ExperienceService = Depends(get_experience_service)
):
    """
    Remove an existing experience record.
    """
    await experience_service.delete_experience(
        experience_id=experience_id,
        current_user=current_user
    )


@router.post(
    "/skills",
    response_model=List[SkillResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Associate skills with profile",
    description="Accessible only by authenticated Job Seekers. Associates one or multiple master catalog skills."
)
async def add_skills(
    payload: SkillsAdd,
    current_user: User = Depends(get_current_active_user),
    skill_service: SkillService = Depends(get_skill_service)
) -> List[SkillResponse]:
    """
    Add one or multiple skills to the user's profile.
    """
    return await skill_service.add_skills(
        obj_in=payload,
        current_user=current_user
    )


@router.get(
    "/skills",
    response_model=List[SkillResponse],
    status_code=status.HTTP_200_OK,
    summary="List associated skills",
    description="Accessible only by authenticated Job Seekers. Retrieves the user's skills sorted alphabetically."
)
async def list_skills(
    current_user: User = Depends(get_current_active_user),
    skill_service: SkillService = Depends(get_skill_service)
) -> List[SkillResponse]:
    """
    Fetch associated profile skills.
    """
    return await skill_service.get_skills_list(
        current_user=current_user
    )


@router.delete(
    "/skills/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove skill association",
    description="Accessible only by authenticated Job Seekers. Removes a skill from the profile."
)
async def remove_skill(
    skill_id: int,
    current_user: User = Depends(get_current_active_user),
    skill_service: SkillService = Depends(get_skill_service)
):
    """
    Delete a skill mapping association.
    """
    await skill_service.remove_skill(
        skill_id=skill_id,
        current_user=current_user
    )


