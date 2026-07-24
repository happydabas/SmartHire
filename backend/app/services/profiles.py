from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.profiles import ProfileRepository
from app.schemas.profiles import ProfileCreate, ProfileUpdate
from app.models.profiles import JobSeekerProfile
from app.models.users import User, UserRole

class ProfileService:
    """
    Handles business logic transactions for Job Seeker profiles.
    Enforces role guards and one-profile-per-user constraints.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.profile_repo = ProfileRepository()

    async def get_profile(self, current_user: User) -> JobSeekerProfile:
        """
        Retrieve the profile of the current authenticated job seeker.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can access profile endpoints."
            )
            
        profile = await self.profile_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Seeker profile not found."
            )
        return profile

    async def create_profile(self, obj_in: ProfileCreate, current_user: User) -> JobSeekerProfile:
        """
        Create a new profile for the authenticated job seeker.
        Ensures a user can only have one profile record.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can create profile records."
            )
            
        existing = await self.profile_repo.get_by_user_id(self.db, user_id=current_user.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A profile record already exists for this account."
            )
            
        return await self.profile_repo.create(
            self.db,
            obj_in=obj_in,
            user_id=current_user.id
        )

    async def update_profile(self, obj_in: ProfileUpdate, current_user: User) -> JobSeekerProfile:
        """
        Update the current job seeker's profile details.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers can edit profile records."
            )
            
        profile = await self.profile_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Seeker profile not found. Please create a profile first."
            )
            
        return await self.profile_repo.update(
            self.db,
            db_obj=profile,
            obj_in=obj_in
        )
