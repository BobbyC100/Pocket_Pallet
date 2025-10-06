-- Migration: Add cost_events table for AI cost tracking
-- Created: 2025-10-05

CREATE TABLE IF NOT EXISTS "cost_events" (
  "id" text PRIMARY KEY NOT NULL,
  "operation" text NOT NULL,
  "model" text NOT NULL,
  "input_tokens" text NOT NULL,
  "output_tokens" text NOT NULL,
  "total_tokens" text NOT NULL,
  "input_cost" text NOT NULL,
  "output_cost" text NOT NULL,
  "total_cost" text NOT NULL,
  "user_id" uuid,
  "anonymous_id" text,
  "metadata" jsonb,
  "created_at" text NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "cost_events_user_id_idx" ON "cost_events" ("user_id");
CREATE INDEX IF NOT EXISTS "cost_events_anonymous_id_idx" ON "cost_events" ("anonymous_id");
CREATE INDEX IF NOT EXISTS "cost_events_created_at_idx" ON "cost_events" ("created_at");
CREATE INDEX IF NOT EXISTS "cost_events_operation_idx" ON "cost_events" ("operation");

