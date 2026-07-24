import datetime
from typing import TYPE_CHECKING, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.users import User

class JobSeekerProfile(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'job_seeker_profiles' table.
    """
    __tablename__ = "job_seeker_profiles"

    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the profile"
    )

    user_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        comment="Foreign key linking to the owner user account"
    )

    full_name: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Full name of the job seeker"
    )

    phone_number: Mapped[str] = mapped_column(
        sa.String(20),
        nullable=False,
        comment="Phone number of the job seeker"
    )

    date_of_birth: Mapped[datetime.date] = mapped_column(
        sa.Date,
        nullable=False,
        comment="Date of birth of the job seeker"
    )

    gender: Mapped[str] = mapped_column(
        sa.String(20),
        nullable=False,
        comment="Gender of the job seeker"
    )

    address: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        comment="Street address"
    )

    city: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="City of residence"
    )

    state: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="State of residence"
    )

    country: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Country of residence"
    )

    linkedin_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="LinkedIn profile URL"
    )

    github_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="GitHub profile URL"
    )

    portfolio_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Portfolio URL"
    )

    professional_summary: Mapped[Optional[str]] = mapped_column(
        sa.Text,
        nullable=True,
        comment="Professional summary"
    )

    profile_photo_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Profile picture URL"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="profile",
        lazy="selectin"
    )
