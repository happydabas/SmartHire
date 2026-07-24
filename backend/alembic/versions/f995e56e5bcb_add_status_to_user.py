"""Add status to user

Revision ID: f995e56e5bcb
Revises: 4d483dd94fc6
Create Date: 2026-07-19 10:21:40.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f995e56e5bcb'
down_revision: Union[str, None] = '4d483dd94fc6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the user_status_enum type in PostgreSQL first
    user_status_enum = sa.Enum('ACTIVE', 'INACTIVE', name='user_status_enum')
    user_status_enum.create(op.get_bind(), checkfirst=True)
    
    # Add column status using the enum
    op.add_column(
        'users', 
        sa.Column(
            'status', 
            sa.Enum('ACTIVE', 'INACTIVE', name='user_status_enum', inherit_schema=True), 
            nullable=False, 
            comment='Account active status',
            server_default='ACTIVE'
        )
    )


def downgrade() -> None:
    op.drop_column('users', 'status')
    
    # Drop the user_status_enum type in PostgreSQL
    user_status_enum = sa.Enum('ACTIVE', 'INACTIVE', name='user_status_enum')
    user_status_enum.drop(op.get_bind(), checkfirst=True)
