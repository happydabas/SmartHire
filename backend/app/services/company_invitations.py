import datetime
import secrets
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.company_invitations import CompanyInvitationRepository
from app.repositories.companies import CompanyRepository
from app.models.company_invitations import CompanyInvitation, InvitationStatus
from app.models.users import User, UserRole

class CompanyInvitationService:
    """
    Handles recruiter invitations flow:
    - Sends invitations (validates company ownership and checks duplicates).
    - Accepts invitations (enforces token checks, roles, and email matches).
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.invitation_repo = CompanyInvitationRepository()
        self.company_repo = CompanyRepository()

    async def create_invitation(
        self, 
        company_id: int, 
        recruiter_email: str, 
        owner_id: int
    ) -> CompanyInvitation:
        """
        Create a new recruiter invitation.
        - Verifies company ownership.
        - Checks for existing pending invitation.
        - Generates secure token.
        - Sets 48-hour expiration.
        """
        # 1. Fetch company profile
        company = await self.company_repo.get_by_id(self.db, company_id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company profile not found."
            )

        # 2. Verify company ownership
        if company.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to send recruiter invitations for this company."
            )

        # 3. Prevent duplicate pending invitations for the same email and company
        existing = await self.invitation_repo.get_pending_by_email_and_company(
            self.db, 
            email=recruiter_email, 
            company_id=company_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A pending invitation already exists for this email address and company."
            )

        # 4. Generate unique secure token and expiration (48 hours)
        token = secrets.token_urlsafe(32)
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=48)

        # 5. Persist record using repository layer
        return await self.invitation_repo.create(
            self.db,
            company_id=company_id,
            recruiter_email=recruiter_email,
            token=token,
            expires_at=expires_at
        )

    async def accept_invitation(self, token: str, current_user: User) -> dict:
        """
        Accept an invitation.
        - Validates invitation token.
        - Checks expiration.
        - Validates PENDING status.
        - Verifies user role is RECRUITER.
        - Verifies user email matches invited email.
        - Links recruiter user to the company.
        - Updates invitation status to ACCEPTED.
        """
        # 1. Load invitation record
        invitation = await self.invitation_repo.get_by_token(self.db, token=token)
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation token is invalid."
            )

        # 2. Check invitation status is PENDING
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation is no longer pending."
            )

        # 3. Check expiration
        now = datetime.datetime.now(datetime.timezone.utc)
        if invitation.expires_at < now:
            # Update status to EXPIRED
            await self.invitation_repo.update_status(
                self.db, 
                db_obj=invitation, 
                status=InvitationStatus.EXPIRED
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation has expired."
            )

        # 4. Verify user role is RECRUITER
        if current_user.role != UserRole.RECRUITER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only users with the RECRUITER role can accept invitations."
            )

        # 5. Verify user email matches invited email
        if current_user.email != invitation.recruiter_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation was sent to a different email address."
            )

        # 6. Link recruiter user to company
        current_user.company_id = invitation.company_id
        self.db.add(current_user)
        
        # 7. Update invitation status to ACCEPTED
        await self.invitation_repo.update_status(
            self.db, 
            db_obj=invitation, 
            status=InvitationStatus.ACCEPTED
        )
        
        # 8. Commit both transactions
        await self.db.commit()

        return {
            "status": "success",
            "message": "Invitation accepted successfully.",
            "company_id": invitation.company_id
        }
