from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.users import UserRepository
from app.schemas.users import UserCreate
from app.models.users import User
from app.auth.hashing import hash_password

class UserService:
    """
    Handles registration business logic.
    Decoupled from direct database query syntax by leveraging UserRepository.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository()

    async def register_user(self, user_in: UserCreate) -> User:
        """
        Register a new candidate or recruiter user.
        - Checks for duplicate emails.
        - Hashes password.
        - Deletes password keys from outputs.
        """
        # 1. Normalize email address
        user_in.email = user_in.email.strip().lower()

        # 2. Verify email uniqueness
        existing_user = await self.user_repo.get_by_email(self.db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user account with this email address already exists."
            )
        
        # 2. Hash raw credentials password using bcrypt
        hashed_pw = hash_password(user_in.password)
        
        # 3. Persist record using repository layer
        created_user = await self.user_repo.create(
            self.db, 
            obj_in=user_in, 
            hashed_password=hashed_pw
        )
        return created_user
