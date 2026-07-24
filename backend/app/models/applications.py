import enum
import datetime
from decimal import Decimal
from typing import List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base, TimestampMixin

class ApplicationStatus(str, enum.Enum):
    """centralized job application ATS stages enum."""
    APPLIED = "APPLIED"
    SCREENING = "SCREENING"
    INTERVIEW = "INTERVIEW"
    SELECTED = "SELECTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"

class Application(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'applications' table.
    Binds a Job seeker's profile to a Job posting representing their job application.
    """
    __tablename__ = "applications"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the application record"
    )

    # Foreign Key pointing to the Jobs table
    job_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the applied job posting"
    )

    # Foreign Key pointing to the Users table
    user_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the applicant user account"
    )

    # AI Match score
    match_score: Mapped[Optional[Decimal]] = mapped_column(
        sa.Numeric(5, 2),
        nullable=True,
        comment="AI-calculated profile-job relevance match percentage score"
    )

    # Foreign Key pointing to the Pipeline Stages table
    current_stage_id: Mapped[Optional[int]] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("pipeline_stages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Foreign key linking to the active hiring stage of the application"
    )

    # Application submission timestamp
    applied_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp representing application submit time"
    )

    # Status of the application
    status: Mapped[ApplicationStatus] = mapped_column(
        sa.String(50),
        nullable=False,
        default=ApplicationStatus.APPLIED,
        comment="Current status of the job application"
    )

    # Foreign Key pointing to the Resumes table
    resume_id: Mapped[Optional[int]] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("resumes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Foreign key linking to the resume used for the application"
    )

    # Unique constraint
    __table_args__ = (
        sa.UniqueConstraint("user_id", "job_id", name="uq_applications_user_job"),
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Job
    job: Mapped["Job"] = relationship(
        "Job",
        back_populates="applications",
        lazy="selectin"
    )

    # Many-to-One relationship back to User
    user: Mapped["User"] = relationship(
        "User",
        back_populates="applications",
        lazy="selectin"
    )

    # Many-to-One relationship back to Resume
    resume: Mapped[Optional["Resume"]] = relationship(
        "Resume",
        back_populates="applications",
        lazy="selectin"
    )

    # Many-to-One relationship with PipelineStage
    current_stage: Mapped[Optional["PipelineStage"]] = relationship(
        "PipelineStage",
        back_populates="applications",
        foreign_keys=[current_stage_id],
        lazy="selectin"
    )

    # One-to-Many relationship with ApplicationStatusHistory tracking records
    # Deleting the application cascades down and deletes its status history records
    status_history: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # One-to-Many relationship with RecruiterNotes
    # Deleting the application deletes recruiter evaluation notes
    recruiter_notes: Mapped[List["RecruiterNote"]] = relationship(
        "RecruiterNote",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
