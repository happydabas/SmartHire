from typing import TYPE_CHECKING, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.resumes import Resume

class Project(Base):
    """
    SQLAlchemy Model representing the 'projects' table.
    Holds personal or professional project details linked to a candidate's resume (one-to-many).
    """
    __tablename__ = "projects"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the project record"
    )

    # Foreign Key pointing to the Resumes table
    resume_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated resume"
    )

    # Project metadata
    project_title: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Title or name of the project"
    )

    description: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
        comment="Detailed explanation of the project work, scope, and target outcomes"
    )

    technologies_used: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        comment="Comma-separated list or description of technologies used"
    )

    # Project URLs
    github_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Repository link on GitHub/GitLab (optional)"
    )

    live_demo_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="URL pointing to the running live application demo (optional)"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Resume
    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="projects",
        lazy="selectin"
    )
