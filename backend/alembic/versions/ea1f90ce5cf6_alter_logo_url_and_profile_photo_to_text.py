"""alter_logo_url_and_profile_photo_to_text

Revision ID: ea1f90ce5cf6
Revises: f0282cf311dd
Create Date: 2026-09-15 11:43:10.463359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ea1f90ce5cf6'
down_revision: Union[str, None] = 'f0282cf311dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'companies',
        'logo_url',
        existing_type=sa.VARCHAR(length=255),
        type_=sa.Text(),
        existing_nullable=True
    )
    op.alter_column(
        'job_seeker_profiles',
        'profile_photo_url',
        existing_type=sa.VARCHAR(length=255),
        type_=sa.Text(),
        existing_nullable=True
    )


def downgrade() -> None:
    op.alter_column(
        'job_seeker_profiles',
        'profile_photo_url',
        existing_type=sa.Text(),
        type_=sa.VARCHAR(length=255),
        existing_nullable=True
    )
    op.alter_column(
        'companies',
        'logo_url',
        existing_type=sa.Text(),
        type_=sa.VARCHAR(length=255),
        existing_nullable=True
    )
