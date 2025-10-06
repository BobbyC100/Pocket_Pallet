import { pgTable, uuid, text, timestamp, jsonb, boolean, pgEnum, integer, real, vector } from 'drizzle-orm/pg-core';

// Enums
export const authProviderEnum = pgEnum('auth_provider', ['email', 'google', 'anonymous']);
export const documentTypeEnum = pgEnum('document_type', ['brief', 'vision_statement', 'vision_framework_v2', 'executive_onepager', 'vc_summary']);
export const eventTypeEnum = pgEnum('event_type', ['created_brief', 'saved_brief', 'exported_doc', 'signed_up', 'upgraded_account']);
export const lensEventTypeEnum = pgEnum('lens_event_type', [
  'doc_created', 'doc_edited', 'doc_submitted', 
  'lens_scored', 'score_viewed', 'reflection_viewed',
  'regenerate_with_lens'
]);

// RGRS Enums
export const sourceTypeEnum = pgEnum('source_type', ['paper', 'article', 'book', 'report', 'thesis']);
export const claimLabelEnum = pgEnum('claim_label', ['confirmed', 'needs_citation', 'unsupported']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique(), // Clerk user ID (null for anonymous)
  email: text('email'),
  authProvider: authProviderEnum('auth_provider').notNull().default('anonymous'),
  anonymousId: text('anonymous_id').unique(), // For anonymous users before upgrade
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profiles table (optional metadata)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  name: text('name'),
  company: text('company'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  anonymousId: text('anonymous_id'), // For anonymous users
  type: documentTypeEnum('type').notNull(),
  title: text('title'),
  contentJson: jsonb('content_json').notNull(), // Store full document as JSON
  metadata: jsonb('metadata'), // Store additional data (qaChecks, etc.)
  isPublic: boolean('is_public').default(false), // For shareable links later
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Connections table (OAuth connections)
export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').notNull(), // 'google', etc.
  providerUserId: text('provider_user_id').notNull(),
  scopes: text('scopes').array(), // Array of granted scopes
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Exports table
export const exports = pgTable('exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  target: text('target').notNull(), // 'google_docs', 'pdf', 'markdown', etc.
  externalFileId: text('external_file_id'), // Google Doc ID, etc.
  url: text('url'), // Direct link to exported file
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Events/Audit table (for analytics)
export const eventsAudit = pgTable('events_audit', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  anonymousId: text('anonymous_id'), // Track anonymous actions too
  eventType: eventTypeEnum('event_type').notNull(),
  eventData: jsonb('event_data'), // Flexible JSON for event details
  metadata: jsonb('metadata'), // Device, browser, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Founder's Lens Events (for pattern detection and analytics)
export const lensEvents = pgTable('lens_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  anonymousId: text('anonymous_id'), // Track anonymous users
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  eventType: lensEventTypeEnum('event_type').notNull(),
  metadata: jsonb('metadata'), // Scores, edit counts, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vision Embeddings (for alignment scoring)
export const visionEmbeddings = pgTable('vision_embeddings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  summary: text('summary'), // Plain text summary of vision
  embedding: text('embedding').notNull(), // JSON string of embedding vector
  sourceDocuments: text('source_documents').array(), // Document IDs that contributed
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Lens Reflections (generated insights)
export const lensReflections = pgTable('lens_reflections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reflectionText: text('reflection_text').notNull(),
  averageScores: jsonb('average_scores'), // {clarity, alignment, actionability}
  patterns: jsonb('patterns'), // Detected behavioral patterns
  viewed: boolean('viewed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Cost Events (for AI cost tracking)
export const costEvents = pgTable('cost_events', {
  id: text('id').primaryKey(), // Use requestId as primary key
  operation: text('operation').notNull(), // e.g., 'generate-brief', 'refine-section'
  model: text('model').notNull(), // e.g., 'gpt-4-turbo-preview', 'gpt-3.5-turbo'
  inputTokens: text('input_tokens').notNull(), // Store as text to avoid integer overflow
  outputTokens: text('output_tokens').notNull(),
  totalTokens: text('total_tokens').notNull(),
  inputCost: text('input_cost').notNull(), // Store as text for precision
  outputCost: text('output_cost').notNull(),
  totalCost: text('total_cost').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  anonymousId: text('anonymous_id'),
  metadata: jsonb('metadata'), // Additional context (duration, etc.)
  createdAt: text('created_at').notNull(), // ISO timestamp as text
});

// ============================================================================
// RGRS (Research-Grounded Reasoning System) Tables
// ============================================================================

// Research Sources (papers, articles, books)
export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: sourceTypeEnum('type').notNull(),
  authors: text('authors').array(), // Array of author names
  url: text('url'), // Link to paper or DOI
  publishedAt: timestamp('published_at'), // Publication date
  vettingScore: real('vetting_score'), // 0-1 quality score (peer-reviewed, relevance, recency)
  hash: text('hash').unique().notNull(), // Content hash for deduplication
  metadata: jsonb('metadata'), // Journal, DOI, abstract, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Text Chunks with Embeddings
export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'cascade' }).notNull(),
  ord: integer('ord').notNull(), // Order within source
  content: text('content').notNull(), // ~1k tokens
  tokens: integer('tokens').notNull(), // Token count
  section: text('section'), // e.g., "Introduction", "Discussion", "Findings"
  embedding: vector('embedding', { dimensions: 1536 }), // text-embedding-3-small
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Extracted Facts (subject-predicate-object triples)
export const facts = pgTable('facts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'cascade' }).notNull(),
  chunkId: uuid('chunk_id').references(() => chunks.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(), // e.g., "goal_congruence"
  predicate: text('predicate').notNull(), // e.g., "increases"
  object: text('object').notNull(), // e.g., "employee_engagement"
  evidence: text('evidence'), // Direct quote or paraphrase
  confidence: real('confidence'), // 0-1 extraction confidence
  verified: boolean('verified').default(false), // Human-verified
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Generated Claims (with citations and confidence)
export const claims = pgTable('claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  claim: text('claim').notNull(), // The actual claim/insight
  supportingChunkIds: uuid('supporting_chunk_ids').array(), // References to chunks
  supportingFactIds: uuid('supporting_fact_ids').array(), // References to facts
  confidence: real('confidence').notNull(), // 0-1 confidence score
  section: text('section'), // Which part of doc (e.g., "vision", "strategy")
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Claim Evaluations (human feedback for learning)
export const evals = pgTable('evals', {
  id: uuid('id').primaryKey().defaultRandom(),
  claimId: uuid('claim_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  label: claimLabelEnum('label').notNull(), // confirmed / needs_citation / unsupported
  notes: text('notes'), // Optional reviewer notes
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// BAI (Banyan Alignment Index) Scores
export const baiScores = pgTable('bai_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  goalCongruence: real('goal_congruence').notNull(), // 0-1
  roleClarity: real('role_clarity').notNull(), // 0-1
  metricCoherence: real('metric_coherence').notNull(), // 0-1
  voiceSafety: real('voice_safety').notNull(), // 0-1
  docConsistency: real('doc_consistency').notNull(), // 0-1
  overallScore: real('overall_score').notNull(), // Average of 5 signals
  metadata: jsonb('metadata'), // Detailed breakdown
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type Export = typeof exports.$inferSelect;
export type NewExport = typeof exports.$inferInsert;
export type EventAudit = typeof eventsAudit.$inferSelect;
export type NewEventAudit = typeof eventsAudit.$inferInsert;
export type LensEvent = typeof lensEvents.$inferSelect;
export type NewLensEvent = typeof lensEvents.$inferInsert;
export type VisionEmbedding = typeof visionEmbeddings.$inferSelect;
export type NewVisionEmbedding = typeof visionEmbeddings.$inferInsert;
export type LensReflection = typeof lensReflections.$inferSelect;
export type NewLensReflection = typeof lensReflections.$inferInsert;
export type CostEvent = typeof costEvents.$inferSelect;
export type NewCostEvent = typeof costEvents.$inferInsert;

// RGRS Types
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
export type Fact = typeof facts.$inferSelect;
export type NewFact = typeof facts.$inferInsert;
export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
export type Eval = typeof evals.$inferSelect;
export type NewEval = typeof evals.$inferInsert;
export type BAIScore = typeof baiScores.$inferSelect;
export type NewBAIScore = typeof baiScores.$inferInsert;

