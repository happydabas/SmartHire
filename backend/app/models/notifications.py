import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base

class Notification(Base):
    """
    SQLAlchemy Model representing the 'notifications' table.
    Stores notifications, alert messages, and update prompts sent to users (one-to-many).
    """
    __tablename__ = "notifications"

    # Primary Key - using BIGINT
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True,
        comment="Unique identifier for the notification"
    )

    # Foreign Key pointing to the Users table
    user_id: Mapped[int] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key linking to the recipient user account"
    )

    # Notification summary header
    title: Mapped[str] = mapped_column(
        sa.String(150),
        nullable=False,
        comment="Notification summary or title text"
    )

    # Notification detail content
    message: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
        comment="Comprehensive message body text"
    )

    # Read/Unread flag - defaults to false (unread)
    is_read: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        comment="True if the user has read the notification"
    )

    # Creation timestamp
    created_at: Mapped[datetime.datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp when the notification was created"
    )

    # ==========================================
    # Relationships
    # ==========================================

    # Many-to-One relationship back to User
    user: Mapped["User"] = relationship(
        "User",
        back_populates="notifications",
        lazy="selectin"
    )
