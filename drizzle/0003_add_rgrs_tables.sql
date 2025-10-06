-- RGRS (Research-Grounded Reasoning System) Migration
-- Adds tables for research-backed reasoning with citations and learning loop

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create RGRS enums
CREATE TYPE source_type AS ENUM ('paper', 'article', 'book', 'report', 'thesis');
CREATE TYPE claim_label AS ENUM ('confirmed', 'needs_citation', 'unsupported');

-- Research Sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type source_type NOT NULL,
  authors TEXT[],
  url TEXT,
  published_at TIMESTAMP,
  vetting_score REAL,
  hash TEXT UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Text Chunks with Embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  ord INTEGER NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  section TEXT,
  embedding vector(1536), -- text-embedding-3-small dimensions
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Extracted Facts (subject-predicate-object triples)
CREATE TABLE IF NOT EXISTS facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  chunk_id UUID REFERENCES chunks(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  predicate TEXT NOT NULL,
  object TEXT NOT NULL,
  evidence TEXT,
  confidence REAL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Generated Claims (with citations and confidence)
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  claim TEXT NOT NULL,
  supporting_chunk_ids UUID[],
  supporting_fact_ids UUID[],
  confidence REAL NOT NULL,
  section TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Claim Evaluations (human feedback for learning)
CREATE TABLE IF NOT EXISTS evals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
  label claim_label NOT NULL,
  notes TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- BAI (Banyan Alignment Index) Scores
CREATE TABLE IF NOT EXISTS bai_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  goal_congruence REAL NOT NULL,
  role_clarity REAL NOT NULL,
  metric_coherence REAL NOT NULL,
  voice_safety REAL NOT NULL,
  doc_consistency REAL NOT NULL,
  overall_score REAL NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance

-- Chunks: HNSW index for vector similarity search
CREATE INDEX idx_chunks_embedding ON chunks USING hnsw (embedding vector_cosine_ops);

-- Chunks: Filter by source
CREATE INDEX idx_chunks_source ON chunks(source_id);

-- Chunks: Filter by section (boost/demote by section type)
CREATE INDEX idx_chunks_section ON chunks(section);

-- Facts: Filter by key concepts
CREATE INDEX idx_facts_subject ON facts(subject);
CREATE INDEX idx_facts_predicate ON facts(predicate);
CREATE INDEX idx_facts_object ON facts(object);
CREATE INDEX idx_facts_verified ON facts(verified);

-- Facts: Lookup by source
CREATE INDEX idx_facts_source ON facts(source_id);

-- Claims: Lookup by document
CREATE INDEX idx_claims_document ON claims(document_id);

-- Claims: Filter by confidence
CREATE INDEX idx_claims_confidence ON claims(confidence);

-- Evals: Lookup by claim
CREATE INDEX idx_evals_claim ON evals(claim_id);

-- Evals: Filter by label for learning loop
CREATE INDEX idx_evals_label ON evals(label);

-- BAI Scores: Lookup by document
CREATE INDEX idx_bai_document ON bai_scores(document_id);

-- BAI Scores: Filter by overall score
CREATE INDEX idx_bai_overall ON bai_scores(overall_score);

-- Sources: Unique hash for deduplication
CREATE INDEX idx_sources_hash ON sources(hash);

-- Sources: Filter by type
CREATE INDEX idx_sources_type ON sources(type);

-- Sources: Filter by vetting score
CREATE INDEX idx_sources_vetting ON sources(vetting_score);

