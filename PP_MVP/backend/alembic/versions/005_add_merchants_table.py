"""add merchants table

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2025-10-16

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON, ARRAY


# revision identifiers, used by Alembic.
revision = 'd4e5f6g7h8i9'
down_revision = 'c3d4e5f6g7h8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create merchants table
    op.create_table(
        'merchants',
        sa.Column('id', sa.String(36), primary_key=True),  # UUID
        sa.Column('name', sa.String(255), nullable=False, index=True),
        sa.Column('slug', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('type', sa.String(50), nullable=True, index=True),  # wine_shop, bistro, bar
        sa.Column('address', sa.Text, nullable=True),
        sa.Column('geo', JSON, nullable=True),  # {lat: float, lng: float}
        sa.Column('country_code', sa.String(2), nullable=True, index=True),
        sa.Column('tags', ARRAY(sa.String), nullable=True),
        sa.Column('about', sa.Text, nullable=True),
        sa.Column('hours', JSON, nullable=True),  # {mon: "9-5", tue: "9-5", ...}
        sa.Column('contact', JSON, nullable=True),  # {phone, website, instagram, email}
        sa.Column('hero_image', sa.String(500), nullable=True),
        sa.Column('gallery_images', ARRAY(sa.String), nullable=True),
        sa.Column('source_url', sa.String(500), nullable=True),  # Google Maps URL
        sa.Column('last_synced', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, onupdate=sa.func.now()),
    )
    
    # Add optional link from scraper sources to merchants
    op.add_column('sources', sa.Column('merchant_id', sa.String(36), nullable=True))
    op.create_foreign_key(
        'fk_sources_merchant_id',
        'sources', 'merchants',
        ['merchant_id'], ['id'],
        ondelete='SET NULL'
    )
    op.create_index('ix_sources_merchant_id', 'sources', ['merchant_id'])


def downgrade() -> None:
    op.drop_index('ix_sources_merchant_id', 'sources')
    op.drop_constraint('fk_sources_merchant_id', 'sources', type_='foreignkey')
    op.drop_column('sources', 'merchant_id')
    op.drop_table('merchants')

