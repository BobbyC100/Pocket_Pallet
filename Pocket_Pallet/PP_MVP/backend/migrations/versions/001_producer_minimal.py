"""Add minimal producer table

Revision ID: 001_producer_minimal
Revises: 
Create Date: 2025-10-08 23:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_producer_minimal'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum for producer class
    producer_class_enum = postgresql.ENUM(
        'Grower-Producer',
        'Independent', 
        'Cooperative',
        'Negociant',
        'Industrial',
        name='producer_class_min'
    )
    producer_class_enum.create(op.get_bind())
    
    # Create producers_min table
    op.create_table(
        'producers_min',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('class', producer_class_enum, nullable=False, server_default='Independent'),
        sa.Column('flags', postgresql.ARRAY(sa.Text()), nullable=False, server_default='{}'),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_producers_min_class', 'producers_min', ['class'])
    op.create_index('ix_producers_min_flags', 'producers_min', ['flags'], postgresql_using='gin')


def downgrade() -> None:
    op.drop_index('ix_producers_min_flags', table_name='producers_min')
    op.drop_index('ix_producers_min_class', table_name='producers_min')
    op.drop_table('producers_min')
    
    producer_class_enum = postgresql.ENUM(name='producer_class_min')
    producer_class_enum.drop(op.get_bind())

