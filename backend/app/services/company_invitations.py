import datetime
import secrets
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.company_invitations import CompanyInvitationRepository
from app.repositories.companies import CompanyRepository
from app.repositories.users import UserRepository
from app.models.company_invitations import CompanyInvitation, InvitationStatus
from app.models.users import User, UserRole
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt import create_access_token, create_refresh_token
from app.auth.dependencies import clear_user_cache
from app.services.email import EmailService

class CompanyInvitationService:
    """
    Handles recruiter invitations flow:
    - Sends invitations (validates company ownership and checks duplicates).
    - Lists and cancels pending invitations.
    - Inspects invitation token details.
    - Accepts invitations for new and existing users.
    """

    def __init__(self, db: AsyncSession, email_service: Optional[EmailService] = None):
        self.db = db
        self.invitation_repo = CompanyInvitationRepository()
        self.company_repo = CompanyRepository()
        self.user_repo = UserRepository()
        self.email_service = email_service or EmailService()

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
        - Checks if recipient is already a recruiter in this company.
        - Generates secure token.
        - Sets 48-hour expiration.
        """
        # Normalize email address
        recruiter_email = recruiter_email.strip().lower()

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

        # 3. Check if user is already a recruiter in this company
        existing_user = await self.user_repo.get_by_email(self.db, email=recruiter_email)
        if existing_user and existing_user.company_id == company_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This recruiter is already a member of your company."
            )

        # 4. If an existing invitation is present for this email and company (pending/cancelled/expired), refresh its token back to PENDING
        existing_invitation = await self.invitation_repo.get_latest_by_email_and_company(
            self.db, 
            email=recruiter_email, 
            company_id=company_id
        )

        token = secrets.token_urlsafe(32)
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)

        if existing_invitation:
            invitation = await self.invitation_repo.update_token(
                self.db,
                db_obj=existing_invitation,
                token=token,
                expires_at=expires_at
            )
        else:
            invitation = await self.invitation_repo.create(
                self.db,
                company_id=company_id,
                recruiter_email=recruiter_email,
                token=token,
                expires_at=expires_at
            )

        # 5. Fetch owner details for invitation email
        owner = await self.user_repo.get_by_id(self.db, user_id=owner_id)
        owner_name = owner.name if owner else None

        # 6. Send invitation email via SMTP (best-effort, non-blocking for invitation creation).
        try:
            await self.email_service.send_recruiter_invitation_email(
                to_email=recruiter_email,
                company_name=company.name,
                owner_name=owner_name,
                invitation_token=token,
                expires_in_days=7
            )
        except Exception as exc:
            import logging
            logging.getLogger(__name__).warning(
                "SMTP email dispatch failed for %s. Invitation token created successfully: %s", recruiter_email, exc
            )

        try:
            from app.services.notification_service import notify_invitation
            invited_uid = existing_user.id if existing_user else None
            await notify_invitation(
                self.db,
                owner_id=owner_id,
                invited_email=recruiter_email,
                company_name=company.name,
                invited_user_id=invited_uid
            )
        except Exception as notif_err:
            import logging
            logging.getLogger(__name__).warning("Failed to dispatch invitation notification: %s", notif_err)

        return invitation

    async def list_company_invitations(self, company_id: int, owner_id: int) -> List[CompanyInvitation]:
        """
        Retrieve all invitations sent by the company.
        - Enforces company ownership checks.
        """
        company = await self.company_repo.get_by_id(self.db, company_id=company_id)
        if not company or company.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view invitations for this company."
            )
        return await self.invitation_repo.get_by_company(self.db, company_id=company_id)

    async def cancel_invitation(self, company_id: int, invitation_id: int, owner_id: int) -> CompanyInvitation:
        """
        Cancel a pending recruiter invitation safely.
        - Enforces company ownership checks.
        - Returns cancelled status even if record is absent or already cancelled.
        """
        company = await self.company_repo.get_by_id(self.db, company_id=company_id)
        if not company or company.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to cancel invitations for this company."
            )

        invitation = await self.invitation_repo.get_by_id(self.db, invitation_id=invitation_id)
        if not invitation:
            return CompanyInvitation(
                id=invitation_id,
                company_id=company_id,
                recruiter_email="cancelled@smarthire.com",
                invitation_token="cancelled",
                status=InvitationStatus.CANCELLED
            )

        status_val = getattr(invitation.status, "value", str(invitation.status)).lower()
        if status_val == "cancelled":
            return invitation

        return await self.invitation_repo.update_status(
            self.db,
            db_obj=invitation,
            status=InvitationStatus.CANCELLED
        )

    async def get_invitation_details(self, token: str) -> dict:
        """
        Public token inspection. Returns company name, recipient email, expiration, and user existence.
        """
        invitation = await self.invitation_repo.get_by_token(self.db, token=token)
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This invitation link is invalid or expired. Please click 'Copy Link' on your active invitation in Recruiter Management to open the latest link."
            )

        expires_at = invitation.expires_at
        now = datetime.datetime.now(datetime.timezone.utc) if expires_at.tzinfo else datetime.datetime.utcnow()
        is_expired = expires_at < now

        company = await self.company_repo.get_by_id(self.db, company_id=invitation.company_id)
        company_name = company.name if company else "Company"

        existing_user = await self.user_repo.get_by_email(self.db, email=invitation.recruiter_email)

        return {
            "invitation_token": invitation.invitation_token,
            "recruiter_email": invitation.recruiter_email,
            "company_id": invitation.company_id,
            "company_name": company_name,
            "status": invitation.status,
            "expires_at": invitation.expires_at,
            "is_expired": is_expired,
            "existing_user": existing_user is not None
        }

    async def accept_invitation(
        self,
        token: str,
        name: Optional[str] = None,
        password: Optional[str] = None,
        current_user: Optional[User] = None
    ) -> dict:
        """
        Accept an invitation.
        - Validates token, status (PENDING), and expiration.
        - If recipient user exists: verifies password (or current session) and links user to company.
        - If recipient user does not exist: creates new recruiter account with given name & password.
        - Updates invitation status to ACCEPTED.
        - Returns authentication JWT tokens and user payload.
        """
        # 1. Load invitation record
        invitation = await self.invitation_repo.get_by_token(self.db, token=token)
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation token is invalid."
            )

        # 2. Verify status is PENDING
        if invitation.status == InvitationStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation was cancelled by the company owner."
            )
        if invitation.status == InvitationStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation has already been accepted."
            )
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation is no longer pending."
            )

        # 3. Check expiration
        expires_at = invitation.expires_at
        now = datetime.datetime.now(datetime.timezone.utc) if expires_at.tzinfo else datetime.datetime.utcnow()
        if expires_at < now:
            await self.invitation_repo.update_status(
                self.db,
                db_obj=invitation,
                status=InvitationStatus.EXPIRED
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This invitation has expired."
            )

        email = invitation.recruiter_email.lower().strip()
        existing_user = await self.user_repo.get_by_email(self.db, email=email)

        user_to_login = None

        if existing_user:
            # Account exists for invited email
            if current_user and current_user.id == existing_user.id:
                # Logged in as matching user
                user_to_login = existing_user
            else:
                # Need password to authenticate existing user
                if not password:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Password is required to confirm identity for your existing SmartHire account."
                    )
                if not verify_password(password, existing_user.password):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Incorrect password for existing user account."
                    )
                user_to_login = existing_user

            # Attach existing user to company & update role to RECRUITER
            user_to_login.company_id = invitation.company_id
            user_to_login.role = UserRole.RECRUITER
            self.db.add(user_to_login)

        else:
            # New user registration required
            if not name or not name.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Full name is required for registering a new recruiter account."
                )
            if not password or len(password) < 8:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Password must be at least 8 characters long."
                )

            hashed_pw = hash_password(password)

            # Create User model instance directly
            user_to_login = User(
                name=name.strip(),
                email=email,
                password=hashed_pw,
                role=UserRole.RECRUITER,
                company_id=invitation.company_id
            )
            self.db.add(user_to_login)

        # Mark invitation ACCEPTED
        await self.invitation_repo.update_status(
            self.db,
            db_obj=invitation,
            status=InvitationStatus.ACCEPTED
        )

        await self.db.commit()
        await self.db.refresh(user_to_login)

        user_to_login.is_owner = invitation.company.owner_id == user_to_login.id if (invitation and invitation.company) else False
        clear_user_cache(user_to_login.id)

        try:
            from app.services.notification_service import notify_recruiter_joined
            if invitation.company and invitation.company.owner_id:
                rec_name = user_to_login.name or email
                await notify_recruiter_joined(
                    self.db,
                    owner_id=invitation.company.owner_id,
                    recruiter_name=rec_name,
                    company_name=invitation.company.name
                )
        except Exception as notif_err:
            import logging
            logging.getLogger(__name__).warning("Failed to dispatch recruiter joined notification: %s", notif_err)

        # Generate JWT session tokens
        access_token = create_access_token(
            subject=user_to_login.id,
            email=user_to_login.email,
            role=user_to_login.role.value
        )
        refresh_token = create_refresh_token(
            subject=user_to_login.id,
            email=user_to_login.email,
            role=user_to_login.role.value
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_to_login
        }
