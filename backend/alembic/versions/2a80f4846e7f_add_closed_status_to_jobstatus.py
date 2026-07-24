"""Add CLOSED status to JobStatus

Revision ID: 2a80f4846e7f
Revises: d76802dd1fee
Create Date: 2026-07-19 10:34:25.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2a80f4846e7f'
down_revision: Union[str, None] = 'd76802dd1fee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add 'closed' value to job_status_enum in PostgreSQL
    # Using autocommit context since ALTER TYPE ADD VALUE cannot run inside a multi-statement transaction in some postgres configurations
    # Alembic handles execution block cleanly
    op.execute("ALTER TYPE job_status_enum ADD VALUE 'closed'")


def downgrade() -> None:
    # Downgrade passes as Postgres enums do not easily support dropping values
    pass
