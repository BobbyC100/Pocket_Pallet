-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create enums
CREATE TYPE auth_provider AS ENUM ('email', 'google', 'anonymous');
CREATE TYPE document_type AS ENUM ('brief', 'vision_framework_v2', 'executive_onepager', 'vc_summary');
CREATE TYPE event_type AS ENUM ('created_brief', 'saved_brief', 'exported_doc', 'signed_up', 'upgraded_account');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE,
  email TEXT,
  auth_provider auth_provider NOT NULL DEFAULT 'anonymous',
  anonymous_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  type document_type NOT NULL,
  title TEXT,
  content_json JSONB NOT NULL,
  metadata JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  scopes TEXT[],
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Exports table
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  external_file_id TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Events/Audit table
CREATE TABLE events_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  event_type event_type NOT NULL,
  event_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_anonymous_id ON documents(anonymous_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_exports_document_id ON exports(document_id);
CREATE INDEX idx_exports_user_id ON exports(user_id);
CREATE INDEX idx_events_user_id ON events_audit(user_id);
CREATE INDEX idx_events_anonymous_id ON events_audit(anonymous_id);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (
    auth.uid()::text = user_id::text
    OR (user_id IS NULL AND anonymous_id = current_setting('app.anonymous_id', true))
  );

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text
    OR (user_id IS NULL AND anonymous_id = current_setting('app.anonymous_id', true))
  );

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (
    auth.uid()::text = user_id::text
    OR (user_id IS NULL AND anonymous_id = current_setting('app.anonymous_id', true))
  );

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (
    auth.uid()::text = user_id::text
    OR (user_id IS NULL AND anonymous_id = current_setting('app.anonymous_id', true))
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for exports
CREATE POLICY "Users can view own exports"
  ON exports FOR SELECT
  USING (auth.uid()::text = user_id::text);

