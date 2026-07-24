import enum
import datetime
from decimal import Decimal
from typing import List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

class JobType(str, enum.Enum):
    """
    Enum representing employment contract types.
    """
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"


class ExperienceLevel(str, enum.Enum):
    """
    Enum representing candidates experience milestones.
    """
    FRESHER = "Fresher"
    ENTRY = "Entry"
    MID = "Mid"
    SENIOR = "Senior"


class WorkMode(str, enum.Enum):
    """
    Enum representing job workplace location rules.
    """
    REMOTE = "Remote"
    HYBRID = "Hybrid"
    ONSITE = "Onsite"


class JobStatus(str, enum.Enum):
    """
    Enum representing job publishing status.
    """
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"


class Job(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'jobs' table.
    Inherits fields from Base (declarative metadata) and TimestampMixin (created_at, updated_at).
    """
    __tablename__ = "jobs"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the job posting"
    )

    # Foreign Key pointing to the Companies table
    company_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the employer company record"
    )

    # Foreign Key pointing to the Users table (Recruiter)
    recruiter_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the recruiter who created this job listing"
    )

    # Job title
    title: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Job title designation"
    )

    # Job details description
    description: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
        comment="Detailed job description, responsibilities, and requirements text"
    )

    # Geographic / Remote Location
    location: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Physical location (City, State/Country) or 'Remote'"
    )

    # Job Contract Type ENUM field
    job_type: Mapped[JobType] = mapped_column(
        sa.Enum(JobType, name="job_type_enum", inherit_schema=True),
        nullable=False,
        comment="Employment type (Full-time, Part-time, etc.)"
    )

    # Target Experience level ENUM field
    experience_level: Mapped[ExperienceLevel] = mapped_column(
        sa.Enum(ExperienceLevel, name="experience_level_enum", inherit_schema=True),
        nullable=False,
        comment="Target candidate experience range"
    )

    # Workplace work mode location ENUM field
    work_mode: Mapped[WorkMode] = mapped_column(
        sa.Enum(WorkMode, name="work_mode_enum", inherit_schema=True),
        nullable=False,
        default=WorkMode.ONSITE,
        comment="Work mode classification (Remote, Hybrid, Onsite)"
    )

    # Job posting status ENUM field (DRAFT or OPEN)
    status: Mapped[JobStatus] = mapped_column(
        sa.Enum(JobStatus, name="job_status_enum", inherit_schema=True),
        nullable=False,
        default=JobStatus.DRAFT,
        comment="Publishing status of the job listing"
    )

    # Minimum salary
    salary_min: Mapped[Optional[Decimal]] = mapped_column(
        sa.Numeric(12, 2),
        nullable=True,
        comment="Minimum package salary range"
    )

    # Maximum salary
    salary_max: Mapped[Optional[Decimal]] = mapped_column(
        sa.Numeric(12, 2),
        nullable=True,
        comment="Maximum package salary range"
    )

    # Application deadline date-time stamp
    application_deadline: Mapped[Optional[datetime.datetime]] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True,
        comment="Application deadline timestamp"
    )

    # Soft delete status flag
    is_deleted: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        comment="Flag indicating if the job posting is soft-deleted"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship with Company
    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="jobs",
        lazy="selectin"
    )

    # Many-to-One relationship back to User (Recruiter who created the job)
    recruiter: Mapped["User"] = relationship(
        "User",
        back_populates="created_jobs",
        foreign_keys=[recruiter_id],
        lazy="selectin"
    )

    # One-to-Many relationship with JobRequiredSkill entries
    required_skills: Mapped[List["JobRequiredSkill"]] = relationship(
        "JobRequiredSkill",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Many-to-Many relationship with Skill through the junction table
    skills: Mapped[List["Skill"]] = relationship(
        "Skill",
        secondary="job_required_skills",
        back_populates="jobs",
        viewonly=True,
        lazy="selectin"
    )

    # One-to-Many relationship with Applications submitted for this job
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # One-to-One relationship with HiringPipeline
    pipeline: Mapped[Optional["HiringPipeline"]] = relationship(
        "HiringPipeline",
        back_populates="job",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin"
    )
