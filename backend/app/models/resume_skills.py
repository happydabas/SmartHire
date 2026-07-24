from typing import TYPE_CHECKING
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.resumes import Resume
    from app.models.skills import Skill

class ResumeSkill(Base):
    """
    SQLAlchemy Model representing the 'resume_skills' table.
    Serves as a junction table implementing the many-to-many relationship
    between Resumes and Skills.
    """
    __tablename__ = "resume_skills"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the resume-skill mapping"
    )

    # Foreign Key pointing to the Resumes table
    resume_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated resume record"
    )

    # Foreign Key pointing to the Skills table
    skill_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated skill record"
    )

    # Unique constraint
    __table_args__ = (
        sa.UniqueConstraint("resume_id", "skill_id", name="uq_resume_skills_resume_skill"),
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship with Resume
    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="resume_skills",
        lazy="selectin"
    )

    # Many-to-One relationship with Skill
    skill: Mapped["Skill"] = relationship(
        "Skill",
        back_populates="resume_skills",
        lazy="selectin"
    )
