import datetime
from typing import TYPE_CHECKING, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.applications import Application
    from app.models.pipelines import PipelineStage
    from app.models.users import User

class ApplicationStatusHistory(Base):
    """
    SQLAlchemy Model representing the 'application_status_history' table.
    Tracks historical candidate logs as they transition through pipeline stages.
    """
    __tablename__ = "application_status_history"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the history entry"
    )

    # Foreign Key pointing to the Applications table
    application_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the parent application"
    )

    # Foreign Key pointing to the Pipeline Stages table
    stage_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("pipeline_stages.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the pipeline stage status"
    )

    # Foreign Key pointing to the Users table
    updated_by: Mapped[Optional[int]] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Foreign key linking to the user who triggered the update"
    )

    # Automatically set when status records are updated
    updated_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="Timestamp when the transition occurred"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to Application
    application: Mapped["Application"] = relationship(
        "Application",
        back_populates="status_history",
        lazy="selectin"
    )

    # Many-to-One relationship back to PipelineStage
    stage: Mapped["PipelineStage"] = relationship(
        "PipelineStage",
        back_populates="status_history",
        lazy="selectin"
    )

    # Many-to-One relationship with User who triggered the update
    updater: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="status_history_updates",
        lazy="selectin"
    )
