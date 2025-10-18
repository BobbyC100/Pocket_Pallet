"""Add editor note fields to merchants

Revision ID: 006_editor_notes
Revises: 004_add_merchants_columns
Create Date: 2025-10-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_editor_notes'
down_revision = '004_add_merchants_columns'
branch_labels = None
depends_on = None


def upgrade():
    """Add editor note fields to merchants table."""
    op.add_column('merchants', sa.Column('editor_note', sa.Text(), nullable=True))
    op.add_column('merchants', sa.Column('editor_name', sa.Text(), nullable=True))
    op.add_column('merchants', sa.Column('editor_title', sa.Text(), nullable=True))
    op.add_column('merchants', sa.Column('editor_updated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('merchants', sa.Column('editor_updated_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('merchants', sa.Column('editor_is_published', sa.Boolean(), server_default='true', nullable=False))


def downgrade():
    """Remove editor note fields from merchants table."""
    op.drop_column('merchants', 'editor_is_published')
    op.drop_column('merchants', 'editor_updated_by')
    op.drop_column('merchants', 'editor_updated_at')
    op.drop_column('merchants', 'editor_title')
    op.drop_column('merchants', 'editor_name')
    op.drop_column('merchants', 'editor_note')

