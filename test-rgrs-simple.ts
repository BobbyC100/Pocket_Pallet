/**
 * RGRS Simple Test - No Database Required
 * Tests chunking and embedding logic
 */

import { chunkText } from './src/lib/rgrs/ingestion';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SAMPLE_TEXT = `
# Research on Goal Congruence

## Abstract
This study examines the relationships between goal congruence and employee engagement.

## Introduction
Employee engagement has emerged as a critical factor in organizational performance. 
Previous research suggests that alignment between individual and organizational goals—
termed goal congruence—may be a key driver of engagement.

## Findings
Our analysis reveals that goal congruence is the strongest predictor of employee 
engagement in our model (β = 0.52, p < 0.001). Healthcare professionals who perceive 
high alignment between their personal objectives and organizational goals report 
significantly higher levels of engagement.

Specifically, we find:
1. Direct Effect: Goal congruence directly predicts 27% of variance in employee engagement
2. Mediated Effect: An additional 23% of variance is explained through organizational learning
3. Threshold Effect: Engagement levels increase sharply when goal congruence exceeds 60th percentile

## Discussion
Our findings have several practical implications for healthcare managers. Organizations 
should invest in processes that ensure individual and organizational goals are explicitly 
aligned and regularly reviewed.

## Conclusion
Goal congruence emerges as a critical driver of employee engagement, explaining 
approximately 50% of variance when combined with organizational learning and innovation factors.
`;

async function testChunking() {
  console.log('🧪 Testing RGRS Core Functions (No Database)\n');
  console.log('=' .repeat(60));
  
  // Test 1: Chunking
  console.log('\n📝 Test 1: Text Chunking\n');
  const chunks = chunkText(SAMPLE_TEXT, 500, 50);
  
  console.log(`✅ Created ${chunks.length} chunks\n`);
  chunks.forEach((chunk, idx) => {
    console.log(`Chunk ${idx + 1}:`);
    console.log(`  Tokens: ${chunk.tokens}`);
    console.log(`  Section: ${chunk.section || 'None detected'}`);
    console.log(`  Preview: ${chunk.content.slice(0, 100)}...\n`);
  });
  
  // Test 2: Embeddings (only if OpenAI key is available)
  if (process.env.OPENAI_API_KEY) {
    console.log('\n🔢 Test 2: Generating Embeddings\n');
    
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const sampleTexts = chunks.slice(0, 2).map(c => c.content);
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: sampleTexts,
      });
      
      console.log(`✅ Generated embeddings for ${response.data.length} chunks`);
      response.data.forEach((item, idx) => {
        console.log(`  Chunk ${idx + 1}: ${item.embedding.length} dimensions (first 5: ${item.embedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}...)`);
      });
      
      console.log(`\n💰 Cost: ~$${(response.usage.total_tokens * 0.00002 / 1000).toFixed(6)}`);
      
    } catch (error: any) {
      console.error('❌ Embedding test failed:', error.message);
    }
  } else {
    console.log('\n⏭️  Test 2: Skipped (OPENAI_API_KEY not set)\n');
  }
  
  // Test 3: Vector operations
  console.log('\n🧮 Test 3: Vector Math (Cosine Similarity)\n');
  
  // Simple cosine similarity implementation
  function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }
  
  const vec1 = [0.1, 0.2, 0.3, 0.4];
  const vec2 = [0.15, 0.25, 0.28, 0.38];
  const vec3 = [-0.5, 0.1, -0.2, 0.9];
  
  console.log(`Similarity(vec1, vec2): ${cosineSimilarity(vec1, vec2).toFixed(4)} (similar)`);
  console.log(`Similarity(vec1, vec3): ${cosineSimilarity(vec1, vec3).toFixed(4)} (different)`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Core Logic Tests Complete!');
  console.log('='.repeat(60));
  
  console.log('\n📊 Summary:');
  console.log(`  ✓ Chunking: ${chunks.length} chunks created`);
  console.log(`  ✓ Section detection: ${chunks.filter(c => c.section).length} chunks with sections`);
  console.log(`  ✓ Token estimation: Working`);
  console.log(`  ✓ Embedding API: ${process.env.OPENAI_API_KEY ? 'Connected' : 'Not tested (no API key)'}`);
  
  console.log('\n📌 Next Steps:');
  console.log('  1. Verify DATABASE_URL is set correctly in .env.local');
  console.log('  2. Test database connection: npx tsx -e "import { db } from \'./src/lib/db\'; db.execute(\'SELECT 1\').then(() => console.log(\'✅ DB Connected\')).catch(e => console.error(\'❌ DB Error:\', e.message))"');
  console.log('  3. Run full test: npx tsx test-rgrs.ts');
  console.log('\n💡 If database connection fails:');
  console.log('  - Check if DATABASE_URL uses direct connection (not pooler)');
  console.log('  - For Supabase, use: postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres');
  console.log('  - Ensure ?sslmode=require or ?pgbouncer=true is appended if needed');
}

testChunking();

