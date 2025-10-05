import { pgTable, uuid, text, timestamp, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const authProviderEnum = pgEnum('auth_provider', ['email', 'google', 'anonymous']);
export const documentTypeEnum = pgEnum('document_type', ['brief', 'vision_framework_v2', 'executive_onepager', 'vc_summary']);
export const eventTypeEnum = pgEnum('event_type', ['created_brief', 'saved_brief', 'exported_doc', 'signed_up', 'upgraded_account']);
export const lensEventTypeEnum = pgEnum('lens_event_type', [
  'doc_created', 'doc_edited', 'doc_submitted', 
  'lens_scored', 'score_viewed', 'reflection_viewed',
  'regenerate_with_lens'
]);

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

