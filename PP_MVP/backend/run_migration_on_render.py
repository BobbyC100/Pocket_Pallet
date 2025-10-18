#!/usr/bin/env python3
"""
Run this script on Render Shell to apply the migration.

Steps:
1. Go to Render Dashboard → pocket-pallet service → Shell
2. Run: python run_migration_on_render.py
"""

import os
from alembic.config import Config
from alembic import command

# Get the database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment")
    exit(1)

print(f"✓ Found DATABASE_URL: {DATABASE_URL[:30]}...")

# Create Alembic config
alembic_cfg = Config("alembic.ini")
alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)

try:
    print("\nRunning: alembic upgrade head")
    command.upgrade(alembic_cfg, "head")
    print("\n✓ Migration successful!")
    print("\nNew columns added to merchants table:")
    print("  - editor_note")
    print("  - editor_name")
    print("  - editor_title")
    print("  - editor_updated_at")
    print("  - editor_updated_by")
    print("  - editor_is_published")
    print("\nNow you can seed test data:")
    print("curl -X POST https://pocket-pallet.onrender.com/api/v1/sync/seed-editor-note-tacos-fenix")
except Exception as e:
    print(f"\n✗ Migration failed: {e}")
    exit(1)

