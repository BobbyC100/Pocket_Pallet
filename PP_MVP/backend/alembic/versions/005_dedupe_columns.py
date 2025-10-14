"""add dedupe and normalization columns

Revision ID: e1f2g3h4i5j6
Revises: d0c0babe0001
Create Date: 2025-10-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e1f2g3h4i5j6"
down_revision = "d0c0babe0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add normalization columns for deduplication
    op.add_column('wines', sa.Column('norm_producer', sa.Text(), nullable=True))
    op.add_column('wines', sa.Column('norm_cuvee', sa.Text(), nullable=True))
    op.add_column('wines', sa.Column('dedupe_block', sa.Text(), nullable=True))
    
    # Add duplicate tracking columns
    op.add_column('wines', sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False))
    op.add_column('wines', sa.Column('duplicate_of', sa.Integer(), nullable=True))
    
    # Add indexes for performance
    op.create_index('ix_wines_norm_producer', 'wines', ['norm_producer'])
    op.create_index('ix_wines_dedupe_block', 'wines', ['dedupe_block'])
    op.create_index('ix_wines_is_active', 'wines', ['is_active'])
    op.create_index('ix_wines_duplicate_of', 'wines', ['duplicate_of'])
    
    # Add foreign key for duplicate_of
    op.create_foreign_key(
        'fk_wines_duplicate_of',
        'wines', 'wines',
        ['duplicate_of'], ['id'],
        ondelete='SET NULL'
    )
    
    # Add same columns to scraped_wines table
    op.add_column('scraped_wines', sa.Column('norm_producer', sa.Text(), nullable=True))
    op.add_column('scraped_wines', sa.Column('norm_cuvee', sa.Text(), nullable=True))
    op.add_column('scraped_wines', sa.Column('dedupe_block', sa.Text(), nullable=True))
    op.add_column('scraped_wines', sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False))
    op.add_column('scraped_wines', sa.Column('duplicate_of', sa.Integer(), nullable=True))
    
    # Add indexes for scraped_wines
    op.create_index('ix_scraped_wines_norm_producer', 'scraped_wines', ['norm_producer'])
    op.create_index('ix_scraped_wines_dedupe_block', 'scraped_wines', ['dedupe_block'])
    op.create_index('ix_scraped_wines_is_active', 'scraped_wines', ['is_active'])
    op.create_index('ix_scraped_wines_duplicate_of', 'scraped_wines', ['duplicate_of'])
    
    # Add foreign key for duplicate_of on scraped_wines
    op.create_foreign_key(
        'fk_scraped_wines_duplicate_of',
        'scraped_wines', 'scraped_wines',
        ['duplicate_of'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Drop foreign keys
    op.drop_constraint('fk_scraped_wines_duplicate_of', 'scraped_wines', type_='foreignkey')
    op.drop_constraint('fk_wines_duplicate_of', 'wines', type_='foreignkey')
    
    # Drop indexes for scraped_wines
    op.drop_index('ix_scraped_wines_duplicate_of', table_name='scraped_wines')
    op.drop_index('ix_scraped_wines_is_active', table_name='scraped_wines')
    op.drop_index('ix_scraped_wines_dedupe_block', table_name='scraped_wines')
    op.drop_index('ix_scraped_wines_norm_producer', table_name='scraped_wines')
    
    # Drop indexes for wines
    op.drop_index('ix_wines_duplicate_of', table_name='wines')
    op.drop_index('ix_wines_is_active', table_name='wines')
    op.drop_index('ix_wines_dedupe_block', table_name='wines')
    op.drop_index('ix_wines_norm_producer', table_name='wines')
    
    # Drop columns from scraped_wines
    op.drop_column('scraped_wines', 'duplicate_of')
    op.drop_column('scraped_wines', 'is_active')
    op.drop_column('scraped_wines', 'dedupe_block')
    op.drop_column('scraped_wines', 'norm_cuvee')
    op.drop_column('scraped_wines', 'norm_producer')
    
    # Drop columns from wines
    op.drop_column('wines', 'duplicate_of')
    op.drop_column('wines', 'is_active')
    op.drop_column('wines', 'dedupe_block')
    op.drop_column('wines', 'norm_cuvee')
    op.drop_column('wines', 'norm_producer')

