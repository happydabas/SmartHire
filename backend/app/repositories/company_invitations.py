import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.company_invitations import CompanyInvitation, InvitationStatus

class CompanyInvitationRepository:
    """
    Handles direct PostgreSQL operations for the CompanyInvitation model
    using SQLAlchemy 2.0 AsyncSession.
    """

    async def get_by_token(self, db: AsyncSession, token: str) -> Optional[CompanyInvitation]:
        """
        Retrieve an invitation record matching the given invitation token.
        """
        stmt = select(CompanyInvitation).where(CompanyInvitation.invitation_token == token)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_pending_by_email_and_company(
        self, 
        db: AsyncSession, 
        email: str, 
        company_id: int
    ) -> Optional[CompanyInvitation]:
        """
        Retrieve a pending invitation matching the recruiter email and company.
        Used to prevent duplicate pending invitations.
        """
        stmt = select(CompanyInvitation).where(
            CompanyInvitation.recruiter_email == email,
            CompanyInvitation.company_id == company_id,
            CompanyInvitation.status == InvitationStatus.PENDING
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        recruiter_email: str,
        token: str,
        expires_at: datetime.datetime
    ) -> CompanyInvitation:
        """
        Create and persist a new CompanyInvitation record.
        """
        db_invitation = CompanyInvitation(
            company_id=company_id,
            recruiter_email=recruiter_email,
            invitation_token=token,
            status=InvitationStatus.PENDING,
            expires_at=expires_at
        )
        db.add(db_invitation)
        await db.commit()
        await db.refresh(db_invitation)
        return db_invitation

    async def update_status(
        self,
        db: AsyncSession,
        *,
        db_obj: CompanyInvitation,
        status: InvitationStatus
    ) -> CompanyInvitation:
        """
        Update the status of an invitation.
        """
        db_obj.status = status
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
