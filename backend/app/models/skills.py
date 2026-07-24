import datetime
from typing import TYPE_CHECKING, List
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.job_required_skills import JobRequiredSkill
    from app.models.jobs import Job
    from app.models.resume_skills import ResumeSkill
    from app.models.resumes import Resume

class Skill(Base):
    """
    SQLAlchemy Model representing the 'skills' table.
    Holds the master registry of cataloged skills (e.g. Python, React).
    """
    __tablename__ = "skills"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the skill"
    )

    # Unique Skill Name
    skill_name: Mapped[str] = mapped_column(
        sa.String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique name of the skill"
    )

    # Skill Category
    category: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Category grouping the skill (e.g., Frontend, Database)"
    )

    # Timestamp indicating when the skill was cataloged
    created_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp when the skill was added to the catalog"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # One-to-Many relationship with JobRequiredSkill mappings
    # Deleting the master skill cleans up associated job requirements mappings
    job_required_skills: Mapped[List["JobRequiredSkill"]] = relationship(
        "JobRequiredSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Many-to-Many relationship with Job postings requiring this skill
    # Viewonly, since mapping modifications are handled via job_required_skills
    jobs: Mapped[List["Job"]] = relationship(
        "Job",
        secondary="job_required_skills",
        back_populates="skills",
        viewonly=True,
        lazy="selectin"
    )

    # One-to-Many relationship with ResumeSkill mappings
    # Deleting the master skill cleans up associated candidate resume mapping records
    resume_skills: Mapped[List["ResumeSkill"]] = relationship(
        "ResumeSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Many-to-Many relationship with Candidate Resumes claiming this skill
    # Viewonly, since mapping modifications are handled via resume_skills
    resumes: Mapped[List["Resume"]] = relationship(
        "Resume",
        secondary="resume_skills",
        back_populates="skills",
        viewonly=True,
        lazy="selectin"
    )
