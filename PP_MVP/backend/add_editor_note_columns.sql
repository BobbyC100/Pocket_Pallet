-- Add Editorial Note columns to merchants table
-- Run this in Render PostgreSQL console or via psql

-- Add new columns
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_note TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_name TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_title TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_updated_by UUID;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS editor_is_published BOOLEAN DEFAULT TRUE NOT NULL;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'merchants' 
  AND column_name LIKE 'editor_%'
ORDER BY column_name;

