import enum
import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

class InvitationStatus(str, enum.Enum):
    """Enum representing status states for company invitations."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"


class CompanyInvitation(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'company_invitations' table.
    Tracks recruiter invitations sent by company owners.
    """
    __tablename__ = "company_invitations"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the invitation"
    )

    # Foreign Key pointing to the Companies table
    company_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the inviting company"
    )

    # Recruiter email address invited
    recruiter_email: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        index=True,
        comment="Email address of the invited recruiter"
    )

    # Unique Invitation Token (secure generated hash string)
    invitation_token: Mapped[str] = mapped_column(
        sa.String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique token string to validate invitation acceptance"
    )

    # Invitation status ENUM field
    status: Mapped[InvitationStatus] = mapped_column(
        sa.Enum(InvitationStatus, name="invitation_status_enum", inherit_schema=True),
        nullable=False,
        default=InvitationStatus.PENDING,
        comment="Status states: pending, accepted, expired"
    )

    # Expiration datetime stamp
    expires_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        comment="Expiration timestamp when invitation token expires"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Company
    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="invitations",
        lazy="selectin"
    )
