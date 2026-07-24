from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.users import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.auth.hashing import verify_password
from app.auth.jwt import create_access_token, create_refresh_token

class AuthService:
    """
    Orchestrates candidate and recruiter credentials authentication.
    Generates access and refresh tokens upon successful verification.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository()

    async def authenticate(self, credentials: LoginRequest) -> TokenResponse:
        """
        Authenticate user credentials.
        - Checks for user existence.
        - Verifies password hashes.
        - Enforces account active states (defaults to True as no column exists).
        - Generates access/refresh tokens.
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        # 1. Fetch user by email address
        user = await self.user_repo.get_by_email(self.db, email=credentials.email)
        if not user:
            raise credentials_exception
            
        # 2. Verify hashed credentials password
        if not verify_password(credentials.password, user.password):
            raise credentials_exception

        # Note: If User model is upgraded with an 'is_active' column in the future,
        # we would perform the check here:
        # if not user.is_active:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="User account is deactivated."
        #     )
        
        # 3. Generate tokens including user_id, email, and role inside payloads
        access_token = create_access_token(
            subject=user.id,
            email=user.email,
            role=user.role.value
        )
        
        refresh_token = create_refresh_token(
            subject=user.id,
            email=user.email,
            role=user.role.value
        )
        
        # 4. Return tokens along with basic user details
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user
        )
