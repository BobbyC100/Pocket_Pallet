#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function runMigrations() {
  console.log('🗄️  Running database migrations...\n');
  
  try {
    // Migration 1: Lens tables
    console.log('📋 Running migration 0001_add_founders_lens_tables.sql...');
    const migration1 = readFileSync(join(process.cwd(), 'drizzle', '0001_add_founders_lens_tables.sql'), 'utf-8');
    await sql.unsafe(migration1);
    console.log('✅ Migration 0001 complete\n');
    
    // Migration 2: Cost events table
    console.log('📋 Running migration 0002_add_cost_events_table.sql...');
    const migration2 = readFileSync(join(process.cwd(), 'drizzle', '0002_add_cost_events_table.sql'), 'utf-8');
    await sql.unsafe(migration2);
    console.log('✅ Migration 0002 complete\n');
    
    console.log('🎉 All migrations completed successfully!');
    console.log('\nTables created:');
    console.log('  - lens_events');
    console.log('  - vision_embeddings');
    console.log('  - lens_reflections');
    console.log('  - cost_events');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();

