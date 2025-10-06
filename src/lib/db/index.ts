import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection
// Note: DATABASE_URL should be loaded via dotenv before importing this module
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL not set - database operations will fail');
  console.warn('   Make sure to call dotenv.config() before importing this module');
}

// Configure for Supabase
// - prepare: false for Transaction pooling mode
// - ssl: 'require' for Supabase connections (required for Supabase)
// - max: 1 for development (prevents connection pool exhaustion)
// - idle_timeout: 20 seconds before closing idle connections
// - connect_timeout: 10 seconds max wait for initial connection
const client = postgres(connectionString || '', { 
  prepare: false,
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // Suppress notices
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export the underlying client for advanced use cases
export const pgClient = client;

export * from './schema';

