import datetime
from typing import TYPE_CHECKING, List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.resume_skills import ResumeSkill
    from app.models.skills import Skill
    from app.models.education import Education
    from app.models.experience import Experience
    from app.models.projects import Project
    from app.models.certifications import Certification
    from app.models.applications import Application

class Resume(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'resumes' table.
    Inherits fields from Base (declarative metadata) and TimestampMixin (created_at, updated_at).
    Linked one-to-one with a User.
    """
    __tablename__ = "resumes"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the resume"
    )

    # Foreign Key pointing to the Users table
    user_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        comment="Foreign key linking to the owner user account"
    )

    # Candidate profile summary
    summary: Mapped[Optional[str]] = mapped_column(
        sa.Text,
        nullable=True,
        comment="Professional summary overview text"
    )

    # Social links
    github_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Candidate GitHub profile link"
    )

    linkedin_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Candidate LinkedIn profile link"
    )

    portfolio_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Candidate personal portfolio website link"
    )

    # File metadata columns
    file_name: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Original name of the uploaded PDF file"
    )

    file_path: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Local file system storage path"
    )

    file_size: Mapped[Optional[int]] = mapped_column(
        sa.Integer,
        nullable=True,
        comment="File size in bytes"
    )

    uploaded_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True,
        server_default=sa.func.now(),
        comment="Resume uploaded timestamp"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # One-to-One relationship back to User
    user: Mapped["User"] = relationship(
        "User",
        back_populates="resume",
        lazy="selectin"
    )

    # One-to-Many relationship with ResumeSkill entries
    # Deleting the resume cleans up associated skills mappings
    resume_skills: Mapped[List["ResumeSkill"]] = relationship(
        "ResumeSkill",
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Many-to-Many relationship with Skill through the junction table
    # Viewonly, since mapping modifications are handled via resume_skills
    skills: Mapped[List["Skill"]] = relationship(
        "Skill",
        secondary="resume_skills",
        back_populates="resumes",
        viewonly=True,
        lazy="selectin"
    )

    # One-to-Many relationship with Education blocks
    # Deleting the resume automatically cascade deletes education items
    education: Mapped[List["Education"]] = relationship(
        "Education",
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # One-to-Many relationship with Experience blocks
    # Deleting the resume automatically cascade deletes experience items
    experience: Mapped[List["Experience"]] = relationship(
        "Experience",
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # One-to-Many relationship with Projects blocks
    # Deleting the resume automatically cascade deletes project items
    projects: Mapped[List["Project"]] = relationship(
        "Project",
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # One-to-Many relationship with Certifications blocks
    # Deleting the resume automatically cascade deletes certification items
    certifications: Mapped[List["Certification"]] = relationship(
        "Certification",
        back_populates="resume",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # One-to-Many relationship with Application entries referencing this resume
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="resume",
        lazy="selectin"
    )
