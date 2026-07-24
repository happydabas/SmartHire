from typing import TYPE_CHECKING
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.jobs import Job
    from app.models.skills import Skill

class JobRequiredSkill(Base):
    """
    SQLAlchemy Model representing the 'job_required_skills' table.
    Serves as a junction table implementing the many-to-many relationship
    between Jobs and Skills.
    """
    __tablename__ = "job_required_skills"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the job-skill mapping"
    )

    # Foreign Key pointing to the Jobs table
    job_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated job posting"
    )

    # Foreign Key pointing to the Skills table
    skill_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated skill requirement"
    )

    # Unique constraint
    __table_args__ = (
        sa.UniqueConstraint("job_id", "skill_id", name="uq_job_required_skills_job_skill"),
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship with Job
    job: Mapped["Job"] = relationship(
        "Job",
        back_populates="required_skills",
        lazy="selectin"
    )

    # Many-to-One relationship with Skill
    skill: Mapped["Skill"] = relationship(
        "Skill",
        back_populates="job_required_skills",
        lazy="selectin"
    )
