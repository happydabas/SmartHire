from typing import List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

class Company(Base, TimestampMixin):
    """
    SQLAlchemy Model representing the 'companies' table.
    Inherits fields from Base (declarative metadata) and TimestampMixin (created_at, updated_at).
    """
    __tablename__ = "companies"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the company"
    )

    # Unique Company Code (generated automatically, e.g. COMP-XXXXXX)
    company_code: Mapped[str] = mapped_column(
        sa.String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique auto-generated code identifying the company"
    )

    # Owner User Foreign Key
    owner_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the user account that owns the company"
    )

    # Employer name
    name: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Legal name of the employer company"
    )

    # Industry Category
    industry: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Industry domain categorizing the company (e.g. Technology, Finance)"
    )

    # Company size range (e.g., 1-10, 11-50, 100-500)
    company_size: Mapped[str] = mapped_column(
        sa.String(50),
        nullable=False,
        comment="Company employee size range category"
    )

    # Primary office location
    location: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Primary geographic headquarter location"
    )

    # Description/Details
    description: Mapped[Optional[str]] = mapped_column(
        sa.Text,
        nullable=True,
        comment="Company description and profile overview"
    )

    # Logo image URL - Nullable
    logo_url: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="URL pointing to the stored logo image file"
    )

    # Corporate website URL - Nullable
    website: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
        comment="URL pointing to the company's website"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to User (Owner)
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="owned_companies",
        foreign_keys=[owner_id]
    )

    # One-to-Many relationship between Company and Jobs
    # Cascades deletions to jobs if the company profile is deleted.
    jobs: Mapped[List["Job"]] = relationship(
        "Job",
        back_populates="company",
        cascade="all, delete-orphan"
    )

    # One-to-Many relationship between Company and Recruiters
    recruiters: Mapped[List["User"]] = relationship(
        "User",
        back_populates="company",
        foreign_keys="[User.company_id]",
        cascade="save-update, merge"
    )

    # One-to-Many relationship between Company and Invitations
    invitations: Mapped[List["CompanyInvitation"]] = relationship(
        "CompanyInvitation",
        back_populates="company",
        cascade="all, delete-orphan"
    )
