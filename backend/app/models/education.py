import datetime
from typing import Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class Education(Base):
    """
    SQLAlchemy Model representing the 'education' table.
    Holds academic qualifications linked to a candidate's resume (one-to-many).
    """
    __tablename__ = "education"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the education record"
    )

    # Foreign Key pointing to the Resumes table
    resume_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated resume"
    )

    # Academic details
    institution_name: Mapped[str] = mapped_column(
        sa.String(150),
        nullable=False,
        comment="Name of the university, college, or school"
    )

    degree: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Degree attained"
    )

    field_of_study: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Major or field of study"
    )

    start_date: Mapped[datetime.date] = mapped_column(
        sa.Date,
        nullable=False,
        comment="Academic start date"
    )

    end_date: Mapped[Optional[datetime.date]] = mapped_column(
        sa.Date,
        nullable=True,
        comment="Academic end date"
    )

    grade: Mapped[Optional[str]] = mapped_column(
        sa.String(50),
        nullable=True,
        comment="Cumulative Grade / CGPA achieved"
    )

    description: Mapped[Optional[str]] = mapped_column(
        sa.Text,
        nullable=True,
        comment="Additional description, activities, or achievements"
    )

    # Relationships
    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="education",
        lazy="selectin"
    )
