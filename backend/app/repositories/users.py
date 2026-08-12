from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.users import User, UserRole
from app.schemas.users import UserCreate

class UserRepository:
    """
    Handles all direct database queries for the User model.
    Encapsulates SQL executions using SQLAlchemy 2.0 AsyncSession.
    """
    
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """
        Retrieve a user record matching the given email (case-insensitive).
        """
        normalized_email = email.strip().lower()
        stmt = select(User).where(func.lower(User.email) == normalized_email)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, db: AsyncSession, user_id: int) -> Optional[User]:
        """
        Retrieve a user record matching the given primary key ID.
        """
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_recruiters_by_company(self, db: AsyncSession, company_id: int) -> List[User]:
        """
        Retrieve all recruiter accounts linked to the company.
        """
        stmt = select(User).where(
            User.company_id == company_id,
            User.role == UserRole.RECRUITER
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, *, obj_in: UserCreate, hashed_password: str) -> User:
        """
        Create and persist a new User record.
        """
        db_user = User(
            name=obj_in.name,
            email=obj_in.email,
            password=hashed_password,
            role=obj_in.role,
            phone=obj_in.phone,
            profile_image=obj_in.profile_image
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user
