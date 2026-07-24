from typing import TYPE_CHECKING
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.jobs import Job

class SavedJob(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'saved_jobs' table.
    Links a user (job seeker) to their saved jobs (many-to-many junction/mapping).
    """
    __tablename__ = "saved_jobs"

    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the saved job record"
    )

    user_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the user who saved the job"
    )

    job_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the saved job"
    )

    # Unique constraint to prevent duplicate saves
    __table_args__ = (
        sa.UniqueConstraint("user_id", "job_id", name="uq_saved_jobs_user_job"),
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="saved_jobs",
        lazy="selectin"
    )

    job: Mapped["Job"] = relationship(
        "Job",
        lazy="selectin"
    )
