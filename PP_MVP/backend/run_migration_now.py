#!/usr/bin/env python3
"""
Run the editorial notes migration directly on production database.
"""

import os
import sys
from sqlalchemy import create_engine, text

# Load .env file
try:
    with open('.env', 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value
except FileNotFoundError:
    print("❌ .env file not found")
    sys.exit(1)

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in .env")
    sys.exit(1)

print(f"✓ Connecting to database...")
print(f"  {DATABASE_URL[:50]}...")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("\n📋 Adding editor_* columns to merchants table...")
        
        # Add columns one by one with IF NOT EXISTS
        columns = [
            "ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_note TEXT;",
            "ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_name TEXT;",
            "ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_title TEXT;",
            "ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_updated_at TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_updated_by UUID;",
            "ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_is_published BOOLEAN DEFAULT TRUE NOT NULL;"
        ]
        
        for sql in columns:
            conn.execute(text(sql))
            column_name = sql.split('ADD COLUMN IF NOT EXISTS ')[1].split()[0]
            print(f"  ✓ Added {column_name}")
        
        conn.commit()
        
        print("\n🔍 Verifying columns...")
        result = conn.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'merchants' AND column_name LIKE 'editor_%'
            ORDER BY column_name;
        """))
        
        for row in result:
            print(f"  ✓ {row[0]:<25} {row[1]:<20} nullable={row[2]}")
        
        print("\n✅ Migration complete!")
        print("\n🌮 Now testing Tacos Fenix endpoint...")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)

