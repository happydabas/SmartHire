from typing import Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

class RecruiterNote(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'recruiter_notes' table.
    Stores professional feedback, review notes, or evaluation metrics 
    recorded on an application by recruiters (one-to-many).
    """
    __tablename__ = "recruiter_notes"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the note"
    )

    # Foreign Key pointing to the Applications table
    application_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the evaluated application record"
    )

    # Foreign Key pointing to the Users table
    recruiter_id: Mapped[Optional[int]] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Foreign key linking to the recruiter who authored the note"
    )

    # Feedback content text
    note: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
        comment="Evaluation feedback or interview notes text"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Application
    application: Mapped["Application"] = relationship(
        "Application",
        back_populates="recruiter_notes",
        lazy="selectin"
    )

    # Many-to-One relationship back to User (Recruiter profile)
    recruiter: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="recruiter_notes",
        lazy="selectin"
    )
