"""add producer column to wines

Revision ID: a1b2c3d4e5f6
Revises: 
Create Date: 2025-10-12
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '45b621e1f002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # add column if it's not already there
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_cols = {c['name'] for c in inspector.get_columns('wines')}
    if 'producer' not in existing_cols:
        op.add_column('wines', sa.Column('producer', sa.String(), nullable=True))
        op.create_index('ix_wines_producer', 'wines', ['producer'])


def downgrade() -> None:
    # best-effort clean rollback
    with op.batch_alter_table('wines') as batch_op:
        try:
            batch_op.drop_index('ix_wines_producer')
        except Exception:
            pass
        try:
            batch_op.drop_column('producer')
        except Exception:
            pass

