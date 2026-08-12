import enum
from typing import TYPE_CHECKING, List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.companies import Company
    from app.models.jobs import Job
    from app.models.saved_jobs import SavedJob
    from app.models.applications import Application
    from app.models.profiles import JobSeekerProfile
    from app.models.resumes import Resume
    from app.models.notifications import Notification
    from app.models.recruiter_notes import RecruiterNote
    from app.models.application_status_history import ApplicationStatusHistory

class UserRole(str, enum.Enum):
    """
    Enum representing user access levels.
    Mapped to PostgreSQL's native ENUM type for strong constraint checks.
    """
    JOBSEEKER = "jobseeker"
    RECRUITER = "recruiter"
    COMPANY_OWNER = "company_owner"
    ADMIN = "admin"


class UserStatus(str, enum.Enum):
    """
    Enum representing user active states.
    """
    ACTIVE = "active"
    INACTIVE = "inactive"


class User(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'users' table.
    Inherits fields from Base (declarative metadata) and TimestampMixin (created_at, updated_at).
    """
    __tablename__ = "users"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the user account"
    )

    # User full name
    name: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Full name of the user"
    )

    # Unique Email check
    email: Mapped[str] = mapped_column(
        sa.String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique email address used for credentials logging"
    )

    # Hashed Password string
    password: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        comment="Hashed secure credential password string"
    )

    # Role ENUM field
    role: Mapped[UserRole] = mapped_column(
        sa.Enum(UserRole, name="user_role_enum", inherit_schema=True),
        nullable=False,
        default=UserRole.JOBSEEKER,
        comment="Role determining system access permissions"
    )

    # Status ENUM field
    status: Mapped[UserStatus] = mapped_column(
        sa.Enum(UserStatus, name="user_status_enum", inherit_schema=True),
        nullable=False,
        default=UserStatus.ACTIVE,
        comment="Account active status"
    )

    # Phone number
    phone: Mapped[Optional[str]] = mapped_column(
        sa.String(20),
        nullable=True,
        comment="User phone number including country prefix code"
    )

    # Profile Image URL string
    profile_image: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="URL pointing to the stored profile picture image"
    )

    # Foreign Key pointing to the recruiter's company (nullable, since users can be job seekers or admins)
    company_id: Mapped[Optional[int]] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Foreign key linking to the recruiter's company"
    )

    @property
    def is_owner(self) -> bool:
        """Determines whether the user is the owner of their associated company."""
        if getattr(self, "_is_owner", None) is not None:
            return self._is_owner
        if self.role == UserRole.COMPANY_OWNER:
            return True
        if "owned_companies" in self.__dict__ and self.__dict__["owned_companies"]:
            return True
        if "company" in self.__dict__ and self.__dict__["company"] is not None:
            return self.__dict__["company"].owner_id == self.id
        if not self.company_id:
            return False
        return False

    @is_owner.setter
    def is_owner(self, value: bool):
        self._is_owner = value

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Company (for Recruiters)
    company: Mapped[Optional["Company"]] = relationship(
        "Company",
        back_populates="recruiters",
        foreign_keys=[company_id]
    )

    # One-to-Many relationship with Company Owned profiles
    owned_companies: Mapped[List["Company"]] = relationship(
        "Company",
        back_populates="owner",
        foreign_keys="[Company.owner_id]",
        cascade="all, delete-orphan"
    )

    # One-to-Many relationship with Job postings created by the recruiter/owner
    created_jobs: Mapped[List["Job"]] = relationship(
        "Job",
        back_populates="recruiter",
        foreign_keys="[Job.recruiter_id]",
        cascade="all, delete-orphan"
    )

    # One-to-Many relationship with SavedJob entries
    saved_jobs: Mapped[List["SavedJob"]] = relationship(
        "SavedJob",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # One-to-Many relationship with Application entries submitted by the user
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # One-to-One relationship with JobSeekerProfile
    profile: Mapped[Optional["JobSeekerProfile"]] = relationship(
        "JobSeekerProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # One-to-Many relationship with JobRecruiter entries
    job_assignments: Mapped[List["JobRecruiter"]] = relationship(
        "JobRecruiter",
        back_populates="recruiter",
        cascade="all, delete-orphan"
    )

    # Many-to-Many relationship with Job (assigned jobs) through job_recruiters
    assigned_jobs: Mapped[List["Job"]] = relationship(
        "Job",
        secondary="job_recruiters",
        back_populates="assigned_recruiters",
        viewonly=True
    )

    # One-to-One relationship with Resume
    resume: Mapped[Optional["Resume"]] = relationship(
        "Resume",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # One-to-Many relationship with Notifications sent to the user
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # One-to-Many relationship with RecruiterNotes authored by the user (as recruiter)
    recruiter_notes: Mapped[List["RecruiterNote"]] = relationship(
        "RecruiterNote",
        back_populates="recruiter",
        cascade="save-update, merge"
    )

    # One-to-Many relationship with ApplicationStatusHistory entries updated by the user
    status_history_updates: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory",
        back_populates="updater",
        cascade="save-update, merge"
    )
