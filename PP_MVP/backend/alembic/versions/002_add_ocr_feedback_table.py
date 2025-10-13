"""add_ocr_feedback_table

Revision ID: 002_add_ocr_feedback_table
Revises: 001_add_producer_column
Create Date: 2025-10-12 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_ocr_feedback_table'
down_revision = '001_add_producer_column'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ocr_feedback table
    op.create_table(
        'ocr_feedback',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('parsed_name', sa.String(), nullable=True),
        sa.Column('parsed_producer', sa.String(), nullable=True),
        sa.Column('parsed_region', sa.String(), nullable=True),
        sa.Column('parsed_vintage', sa.String(), nullable=True),
        sa.Column('parsed_price', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('corrected_name', sa.String(), nullable=True),
        sa.Column('corrected_producer', sa.String(), nullable=True),
        sa.Column('corrected_region', sa.String(), nullable=True),
        sa.Column('corrected_vintage', sa.String(), nullable=True),
        sa.Column('corrected_price', sa.String(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ocr_feedback_id'), 'ocr_feedback', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ocr_feedback_id'), table_name='ocr_feedback')
    op.drop_table('ocr_feedback')

