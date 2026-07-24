import datetime
from typing import List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base

class HiringPipeline(Base):
    """
    SQLAlchemy Model representing the 'hiring_pipelines' table.
    Defines the recruiting stages pipeline configured for a job posting.
    Tied one-to-one with a Job posting.
    """
    __tablename__ = "hiring_pipelines"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the hiring pipeline"
    )

    # Foreign Key pointing to the Jobs table
    job_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("jobs.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        comment="Foreign key linking to the associated job posting"
    )

    # Creation timestamp
    created_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp indicating when the pipeline was created"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # One-to-One relationship back to Job
    job: Mapped["Job"] = relationship(
        "Job",
        back_populates="pipeline",
        lazy="selectin"
    )

    # One-to-Many relationship with PipelineStage list
    # Stages are loaded and sorted sequentially by their stage_order
    # Deleting the pipeline cleans up its stages
    stages: Mapped[List["PipelineStage"]] = relationship(
        "PipelineStage",
        back_populates="pipeline",
        cascade="all, delete-orphan",
        order_by="PipelineStage.stage_order",
        lazy="selectin"
    )


class PipelineStage(Base):
    """
    SQLAlchemy Model representing the 'pipeline_stages' table.
    Defines individual stages inside a Hiring Pipeline (one-to-many).
    """
    __tablename__ = "pipeline_stages"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the pipeline stage"
    )

    # Foreign Key pointing to the Hiring Pipelines table
    pipeline_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("hiring_pipelines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the parent hiring pipeline"
    )

    # Stage name
    stage_name: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Label or name of the hiring stage"
    )

    # Stage ordering sequence
    stage_order: Mapped[int] = mapped_column(
        sa.Integer,
        nullable=False,
        comment="Integer determining the chronological order of the stage"
    )

    # Creation timestamp
    created_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp indicating when the stage was created"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to HiringPipeline
    pipeline: Mapped["HiringPipeline"] = relationship(
        "HiringPipeline",
        back_populates="stages",
        lazy="selectin"
    )

    # One-to-Many relationship pointing to Applications actively residing in this stage
    # RESTRICT stage deletion if there are active applications remaining in this stage
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        back_populates="current_stage",
        foreign_keys="[Application.current_stage_id]",
        cascade="save-update, merge",
        lazy="selectin"
    )

    # One-to-Many relationship with ApplicationStatusHistory entries referencing this stage
    # Prevent stage deletion if status logs reference this stage
    status_history: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory",
        back_populates="stage",
        cascade="save-update, merge",
        lazy="selectin"
    )
