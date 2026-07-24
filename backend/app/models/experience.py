import datetime
from typing import Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class Experience(Base):
    """
    SQLAlchemy Model representing the 'experience' table.
    Holds professional work experience details linked to a candidate's resume (one-to-many).
    """
    __tablename__ = "experience"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the experience record"
    )

    # Foreign Key pointing to the Resumes table
    resume_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated resume"
    )

    # Professional details
    company_name: Mapped[str] = mapped_column(
        sa.String(150),
        nullable=False,
        comment="Name of the employing company"
    )

    job_title: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Professional designation (e.g. Senior Software Engineer)"
    )

    start_date: Mapped[datetime.date] = mapped_column(
        sa.Date,
        nullable=False,
        comment="Employment commencement date"
    )

    # Nullable
    end_date: Mapped[Optional[datetime.date]] = mapped_column(
        sa.Date,
        nullable=True,
        comment="Employment conclusion date"
    )

    employment_type: Mapped[Optional[str]] = mapped_column(
        sa.String(100),
        nullable=True,
        comment="Employment type (e.g. Full-time, Part-time)"
    )

    location: Mapped[Optional[str]] = mapped_column(
        sa.String(100),
        nullable=True,
        comment="Work location (e.g. London, Remote)"
    )

    # Toggles active employment status
    currently_working: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        comment="True if the candidate currently holds this position"
    )

    # Work scope descriptions
    description: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
        comment="Details regarding responsibilities and accomplishments in this role"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Resume
    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="experience",
        lazy="selectin"
    )
