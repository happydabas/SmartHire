import datetime
from typing import Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class Certification(Base):
    """
    SQLAlchemy Model representing the 'certifications' table.
    Holds details regarding candidate certifications linked to a resume (one-to-many).
    """
    __tablename__ = "certifications"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the certification record"
    )

    # Foreign Key pointing to the Resumes table
    resume_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated resume"
    )

    # Certification credentials
    certificate_name: Mapped[str] = mapped_column(
        sa.String(150),
        nullable=False,
        comment="Name of the certification"
    )

    issuing_organization: Mapped[str] = mapped_column(
        sa.String(150),
        nullable=False,
        comment="Organization issuing the certification"
    )

    issue_date: Mapped[datetime.date] = mapped_column(
        sa.Date,
        nullable=False,
        comment="Date of certification issue"
    )

    # Verification URL
    credential_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="Link to verify credential certification validation (optional)"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Resume
    resume: Mapped["Resume"] = relationship(
        "Resume",
        back_populates="certifications",
        lazy="selectin"
    )
