import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class JobRecruiter(Base):
    """
    SQLAlchemy Model representing the 'job_recruiters' junction table.
    Enables many-to-many relationship between Jobs and Recruiters.
    """
    __tablename__ = "job_recruiters"

    job_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("jobs.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
        comment="Foreign key linking to the job listing"
    )

    recruiter_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
        comment="Foreign key linking to the assigned recruiter user"
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=datetime.datetime.utcnow,
        server_default=sa.func.now(),
        comment="Timestamp when recruiter was assigned to job"
    )

    # Relationships
    job: Mapped["Job"] = relationship(
        "Job",
        back_populates="job_recruiter_assignments"
    )

    recruiter: Mapped["User"] = relationship(
        "User",
        back_populates="job_assignments"
    )
