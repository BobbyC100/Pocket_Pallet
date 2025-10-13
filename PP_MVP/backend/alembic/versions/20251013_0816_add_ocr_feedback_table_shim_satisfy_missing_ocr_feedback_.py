"""shim: satisfy missing OCR feedback revision

Revision ID: add_ocr_feedback_table
Revises: c3d4e5f6g7h8
Create Date: 2025-10-13 08:16:51.849827

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_ocr_feedback_table'
down_revision = 'c3d4e5f6g7h8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

