import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.companies import CompanyRepository
from app.repositories.users import UserRepository
from app.schemas.companies import CompanyCreate, CompanyUpdate
from app.models.companies import Company
from app.models.users import User, UserStatus

class CompanyService:
    """
    Handles company and associated recruiter management operations.
    Enforces ownership and validation rules.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.company_repo = CompanyRepository()
        self.user_repo = UserRepository()

    async def generate_unique_code(self) -> str:
        """
        Generate a unique identifier code with prefix COMP-
        Checks with PostgreSQL to guarantee code uniqueness.
        """
        while True:
            # Generate a random 6-character hex suffix
            random_suffix = uuid.uuid4().hex[:6].upper()
            code = f"COMP-{random_suffix}"
            
            # Verify uniqueness
            existing = await self.company_repo.get_by_code(self.db, company_code=code)
            if not existing:
                return code

    async def create_company(self, obj_in: CompanyCreate, owner_id: int) -> Company:
        """
        Register a new company profile and link the owner.
        """
        # Check if owner already belongs to a company
        owner = await self.user_repo.get_by_id(self.db, user_id=owner_id)
        if owner and owner.company_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already associated with a company."
            )

        code = await self.generate_unique_code()
        created_company = await self.company_repo.create(
            self.db, 
            obj_in=obj_in, 
            owner_id=owner_id, 
            company_code=code
        )

        # Link owner user account to company
        if owner:
            owner.company_id = created_company.id
            self.db.add(owner)
            await self.db.commit()
            await self.db.refresh(owner)
            from app.auth.dependencies import clear_user_cache
            clear_user_cache(owner.id)

        return created_company

    async def get_company(self, company_id: int) -> Company:
        """
        Retrieve a company record by primary key ID.
        Raises HTTP 404 if profile is not found.
        """
        company = await self.company_repo.get_by_id(self.db, company_id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company profile not found."
            )
        return company

    async def update_company(self, company_id: int, obj_in: CompanyUpdate, user_id: int) -> Company:
        """
        Modify details of an existing company.
        - Verifies ownership.
        """
        company = await self.get_company(company_id=company_id)
        if company.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this company's profile."
            )
            
        return await self.company_repo.update(
            self.db, 
            db_obj=company, 
            obj_in=obj_in
        )

    async def verify_company_owner(self, company_id: int, owner_id: int) -> Company:
        """
        Utility function to load company profile and verify ownership.
        """
        company = await self.get_company(company_id=company_id)
        if company.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access or modify this company's resources."
            )
        return company

    async def get_company_recruiters(self, company_id: int, owner_id: int) -> List[User]:
        """
        List all recruiters belonging to the company.
        - Enforces company ownership checks.
        """
        # Verify ownership
        await self.verify_company_owner(company_id, owner_id)
        
        # Load recruiters
        return await self.user_repo.get_recruiters_by_company(self.db, company_id=company_id)

    async def get_company_recruiter_detail(
        self, 
        company_id: int, 
        recruiter_id: int, 
        owner_id: int
    ) -> User:
        """
        Get details of a specific recruiter of the company.
        - Enforces company ownership.
        - Verifies the recruiter belongs to this company.
        """
        # Verify ownership
        await self.verify_company_owner(company_id, owner_id)
        
        # Fetch recruiter
        recruiter = await self.user_repo.get_by_id(self.db, user_id=recruiter_id)
        if not recruiter or recruiter.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recruiter not found in this company."
            )
        return recruiter

    async def update_recruiter_status(
        self,
        company_id: int,
        recruiter_id: int,
        status_in: UserStatus,
        owner_id: int
    ) -> User:
        """
        Update the status of a recruiter within the company (ACTIVE / INACTIVE).
        - Enforces company ownership.
        """
        # Fetch and verify recruiter belongs to company
        recruiter = await self.get_company_recruiter_detail(
            company_id=company_id,
            recruiter_id=recruiter_id,
            owner_id=owner_id
        )
        
        # Modify status
        recruiter.status = status_in
        self.db.add(recruiter)
        await self.db.commit()
        await self.db.refresh(recruiter)
        return recruiter

    async def remove_recruiter(
        self,
        company_id: int,
        recruiter_id: int,
        owner_id: int
    ) -> User:
        """
        Remove a recruiter from the company by clearing their company_id link.
        - Enforces company ownership.
        """
        # Verify company ownership first
        await self.verify_company_owner(company_id, owner_id)

        if recruiter_id == owner_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company Owner cannot be removed from the company."
            )

        # Fetch and verify recruiter belongs to company
        recruiter = await self.get_company_recruiter_detail(
            company_id=company_id,
            recruiter_id=recruiter_id,
            owner_id=owner_id
        )
        
        # Clear company association link
        recruiter.company_id = None
        self.db.add(recruiter)
        await self.db.commit()
        await self.db.refresh(recruiter)
        from app.auth.dependencies import clear_user_cache
        clear_user_cache(recruiter.id)
        return recruiter
