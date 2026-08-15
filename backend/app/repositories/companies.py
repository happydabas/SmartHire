from typing import Any, Dict, Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.companies import Company
from app.schemas.companies import CompanyCreate, CompanyUpdate

class CompanyRepository:
    """
    Handles direct PostgreSQL operations for the Company model
    using SQLAlchemy 2.0 AsyncSession.
    """
    
    async def get_by_code(self, db: AsyncSession, company_code: str) -> Optional[Company]:
        """
        Query a company by its unique auto-generated company code.
        """
        stmt = select(Company).where(Company.company_code == company_code)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, db: AsyncSession, company_id: int) -> Optional[Company]:
        """
        Query a company by its primary key ID.
        """
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_owner_id(self, db: AsyncSession, owner_id: int) -> Optional[Company]:
        """
        Query a company profile by its owner's user ID.
        """
        stmt = select(Company).where(Company.owner_id == owner_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: CompanyCreate, 
        owner_id: int, 
        company_code: str
    ) -> Company:
        """
        Create and persist a new Company profile record.
        """
        db_company = Company(
            name=obj_in.name,
            website=obj_in.website,
            industry=obj_in.industry,
            company_size=obj_in.company_size,
            location=obj_in.location,
            description=obj_in.description,
            company_code=company_code,
            owner_id=owner_id
        )
        db.add(db_company)
        await db.commit()
        await db.refresh(db_company)
        return db_company

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: Company,
        obj_in: Union[CompanyUpdate, Dict[str, Any]]
    ) -> Company:
        """
        Perform a partial update on a Company profile record.
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        # Update only keys that exist in model structure
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
