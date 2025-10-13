"""add tasting_notes table and wine ownership fields

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2025-10-13

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6g7h8'
down_revision = 'add_ocr_feedback_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add ownership and management fields to wines table
    op.add_column('wines', sa.Column('user_id', sa.String(), nullable=True))
    op.add_column('wines', sa.Column('status', sa.String(), nullable=True))
    op.add_column('wines', sa.Column('rating', sa.Integer(), nullable=True))
    
    # Create indexes for wine ownership
    op.create_index('ix_wines_user_id', 'wines', ['user_id'])
    op.create_foreign_key('fk_wines_user_id', 'wines', 'users', ['user_id'], ['id'], ondelete='SET NULL')
    
    # Create tasting_notes table
    op.create_table(
        'tasting_notes',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('wine_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        
        # Appearance
        sa.Column('appearance_clarity', sa.String(), nullable=True),
        sa.Column('appearance_color', sa.String(), nullable=True),
        sa.Column('appearance_intensity', sa.String(), nullable=True),
        
        # Aroma
        sa.Column('aroma_primary', sa.String(), nullable=True),
        sa.Column('aroma_secondary', sa.String(), nullable=True),
        sa.Column('aroma_tertiary', sa.String(), nullable=True),
        
        # Palate (1-5 scales)
        sa.Column('palate_sweetness', sa.Integer(), nullable=True),
        sa.Column('palate_acidity', sa.Integer(), nullable=True),
        sa.Column('palate_tannin', sa.Integer(), nullable=True),
        sa.Column('palate_body', sa.Integer(), nullable=True),
        sa.Column('palate_alcohol', sa.Integer(), nullable=True),
        
        # Freeform
        sa.Column('flavor_characteristics', sa.Text(), nullable=True),
        sa.Column('finish_length', sa.Integer(), nullable=True),
        
        # Metadata
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )
    
    # Create indexes for tasting notes
    op.create_index('ix_tasting_notes_id', 'tasting_notes', ['id'])
    op.create_index('ix_tasting_notes_wine_id', 'tasting_notes', ['wine_id'])
    op.create_index('ix_tasting_notes_user_id', 'tasting_notes', ['user_id'])
    op.create_index('ix_tn_user_created', 'tasting_notes', ['user_id', 'created_at'])
    op.create_index('ix_tn_wine_user', 'tasting_notes', ['wine_id', 'user_id'])
    
    # Create foreign keys for tasting notes
    op.create_foreign_key('fk_tasting_notes_wine_id', 'tasting_notes', 'wines', ['wine_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_tasting_notes_user_id', 'tasting_notes', 'users', ['user_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # Drop tasting_notes table and indexes
    op.drop_constraint('fk_tasting_notes_user_id', 'tasting_notes', type_='foreignkey')
    op.drop_constraint('fk_tasting_notes_wine_id', 'tasting_notes', type_='foreignkey')
    op.drop_index('ix_tn_wine_user', table_name='tasting_notes')
    op.drop_index('ix_tn_user_created', table_name='tasting_notes')
    op.drop_index('ix_tasting_notes_user_id', table_name='tasting_notes')
    op.drop_index('ix_tasting_notes_wine_id', table_name='tasting_notes')
    op.drop_index('ix_tasting_notes_id', table_name='tasting_notes')
    op.drop_table('tasting_notes')
    
    # Remove wine ownership fields
    op.drop_constraint('fk_wines_user_id', 'wines', type_='foreignkey')
    op.drop_index('ix_wines_user_id', table_name='wines')
    op.drop_column('wines', 'rating')
    op.drop_column('wines', 'status')
    op.drop_column('wines', 'user_id')

