"""Add job attributes and recruiter link

Revision ID: fc21734f57e7
Revises: f995e56e5bcb
Create Date: 2026-07-19 10:29:19.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc21734f57e7'
down_revision: Union[str, None] = 'f995e56e5bcb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create the new Enum types in PostgreSQL
    work_mode_enum = sa.Enum('REMOTE', 'HYBRID', 'ONSITE', name='work_mode_enum')
    work_mode_enum.create(op.get_bind(), checkfirst=True)
    
    job_status_enum = sa.Enum('DRAFT', 'OPEN', name='job_status_enum')
    job_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Add columns
    op.add_column('jobs', sa.Column('recruiter_id', sa.BigInteger(), nullable=False, comment='Foreign key linking to the recruiter who created this job listing'))
    op.add_column('jobs', sa.Column('work_mode', sa.Enum('REMOTE', 'HYBRID', 'ONSITE', name='work_mode_enum', inherit_schema=True), nullable=False, comment='Work mode classification (Remote, Hybrid, Onsite)', server_default='ONSITE'))
    op.add_column('jobs', sa.Column('status', sa.Enum('DRAFT', 'OPEN', name='job_status_enum', inherit_schema=True), nullable=False, comment='Publishing status of the job listing', server_default='DRAFT'))
    op.add_column('jobs', sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=True, comment='Application deadline timestamp'))
    
    # 3. Create index and foreign key
    op.create_index(op.f('ix_jobs_recruiter_id'), 'jobs', ['recruiter_id'], unique=False)
    op.create_foreign_key('fk_jobs_recruiter_id_users', 'jobs', 'users', ['recruiter_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # 1. Drop constraints and indexes
    op.drop_constraint('fk_jobs_recruiter_id_users', 'jobs', type_='foreignkey')
    op.drop_index(op.f('ix_jobs_recruiter_id'), table_name='jobs')
    
    # 2. Drop columns
    op.drop_column('jobs', 'application_deadline')
    op.drop_column('jobs', 'status')
    op.drop_column('jobs', 'work_mode')
    op.drop_column('jobs', 'recruiter_id')
    
    # 3. Drop Enum types in PostgreSQL
    work_mode_enum = sa.Enum('REMOTE', 'HYBRID', 'ONSITE', name='work_mode_enum')
    work_mode_enum.drop(op.get_bind(), checkfirst=True)
    
    job_status_enum = sa.Enum('DRAFT', 'OPEN', name='job_status_enum')
    job_status_enum.drop(op.get_bind(), checkfirst=True)
