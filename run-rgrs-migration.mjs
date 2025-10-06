import postgres from 'postgres';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runRGRSMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    console.log('🗄️  Running RGRS migration...\n');

    const migrationFile = path.join(process.cwd(), 'drizzle', '0003_add_rgrs_tables.sql');
    const migrationSQL = await fs.readFile(migrationFile, 'utf-8');
    
    console.log('📋 Executing 0003_add_rgrs_tables.sql...');
    await sql.unsafe(migrationSQL);
    console.log('✅ RGRS migration complete!\n');
    
    console.log('🎉 RGRS tables created:');
    console.log('  - sources (research papers)');
    console.log('  - chunks (text chunks with embeddings)');
    console.log('  - facts (extracted triples)');
    console.log('  - claims (generated claims with citations)');
    console.log('  - evals (human feedback)');
    console.log('  - bai_scores (Banyan Alignment Index)');
    console.log('\n✨ pgvector extension enabled');
    console.log('✨ HNSW index created on chunks.embedding');

  } catch (error) {
    console.error('❌ Error running RGRS migration:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runRGRSMigration();

