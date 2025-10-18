-- Seed Editorial Note for Tacos Fenix
-- Run this after the migration is applied

UPDATE merchants
SET 
  editor_note = 'Go early before the lunch rush — the shrimp tacos sell out fast. Best enjoyed with a cold Tecate and their house-made hot sauce.',
  editor_name = 'Franny',
  editor_title = 'Local Guide',
  editor_is_published = true,
  editor_updated_at = NOW()
WHERE slug = 'tacos-fenix';

