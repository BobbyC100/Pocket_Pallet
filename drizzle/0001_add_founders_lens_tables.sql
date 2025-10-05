-- Founder's Lens Migration
-- Adds tables for lens events, vision embeddings, and reflections

-- Create lens event type enum
CREATE TYPE lens_event_type AS ENUM (
  'doc_created',
  'doc_edited', 
  'doc_submitted',
  'lens_scored',
  'score_viewed',
  'reflection_viewed',
  'regenerate_with_lens'
);

-- Lens Events table
CREATE TABLE IF NOT EXISTS lens_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type lens_event_type NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Vision Embeddings table
CREATE TABLE IF NOT EXISTS vision_embeddings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT,
  embedding TEXT NOT NULL,
  source_documents TEXT[],
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Lens Reflections table
CREATE TABLE IF NOT EXISTS lens_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reflection_text TEXT NOT NULL,
  average_scores JSONB,
  patterns JSONB,
  viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_lens_events_user ON lens_events(user_id, created_at);
CREATE INDEX idx_lens_events_type ON lens_events(event_type);
CREATE INDEX idx_lens_events_document ON lens_events(document_id);
CREATE INDEX idx_lens_reflections_user ON lens_reflections(user_id, created_at);
CREATE INDEX idx_lens_reflections_viewed ON lens_reflections(user_id, viewed);

