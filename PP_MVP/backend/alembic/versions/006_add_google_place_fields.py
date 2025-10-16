"""add google place fields to merchants

Revision ID: e5f6g7h8i9j0
Revises: d4e5f6g7h8i9
Create Date: 2025-10-16

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = 'e5f6g7h8i9j0'
down_revision = 'd4e5f6g7h8i9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add Google Place sync fields to merchants table."""
    # Add google_place_id - unique identifier from Google
    op.add_column('merchants', sa.Column('google_place_id', sa.String(255), nullable=True, index=True))
    
    # Add google_meta - raw Place Details API response
    op.add_column('merchants', sa.Column('google_meta', JSONB, nullable=True))
    
    # Add google_last_synced - timestamp of last sync
    op.add_column('merchants', sa.Column('google_last_synced', sa.DateTime, nullable=True))
    
    # Add google_sync_status - success, failed, pending, never_synced
    op.add_column('merchants', sa.Column('google_sync_status', sa.String(50), nullable=True, server_default='never_synced'))
    
    # Create index on google_place_id for lookups
    op.create_index('ix_merchants_google_place_id', 'merchants', ['google_place_id'])


def downgrade() -> None:
    """Remove Google Place sync fields from merchants table."""
    op.drop_index('ix_merchants_google_place_id', 'merchants')
    op.drop_column('merchants', 'google_sync_status')
    op.drop_column('merchants', 'google_last_synced')
    op.drop_column('merchants', 'google_meta')
    op.drop_column('merchants', 'google_place_id')

