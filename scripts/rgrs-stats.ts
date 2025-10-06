/**
 * RGRS Corpus Statistics
 * Shows what's currently in your research corpus
 */

// Load environment first
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function showStats() {
  console.log('📚 RGRS Corpus Statistics\n');
  console.log('='.repeat(60));
  
  // Dynamic import after dotenv loads
  const { db } = await import('../src/lib/db');
  const { sources, chunks, facts } = await import('../src/lib/db/schema');
  const { sql } = await import('drizzle-orm');
  
  try {
    // Count sources
    const sourceCount = await db.select({ count: sql<number>`count(*)` }).from(sources);
    const totalSources = Number(sourceCount[0]?.count || 0);
    
    // Count chunks
    const chunkCount = await db.select({ count: sql<number>`count(*)` }).from(chunks);
    const totalChunks = Number(chunkCount[0]?.count || 0);
    
    // Count facts
    const factCount = await db.select({ count: sql<number>`count(*)` }).from(facts);
    const totalFacts = Number(factCount[0]?.count || 0);
    
    // Get all sources with chunk counts
    const allSources = await db
      .select({
        id: sources.id,
        title: sources.title,
        authors: sources.authors,
        type: sources.type,
        publishedAt: sources.publishedAt,
        vettingScore: sources.vettingScore,
        createdAt: sources.createdAt,
      })
      .from(sources)
      .orderBy(sources.createdAt);
    
    // Get chunk counts per source
    const chunkCounts = await db
      .select({
        sourceId: chunks.sourceId,
        count: sql<number>`count(*)`,
      })
      .from(chunks)
      .groupBy(chunks.sourceId);
    
    const chunkCountMap = new Map(chunkCounts.map(c => [c.sourceId, Number(c.count)]));
    
    console.log('\n📊 Summary:');
    console.log(`   Research papers: ${totalSources}`);
    console.log(`   Text chunks: ${totalChunks}`);
    console.log(`   Extracted facts: ${totalFacts}`);
    console.log(`   Avg chunks/paper: ${totalSources > 0 ? (totalChunks / totalSources).toFixed(1) : 0}`);
    
    if (allSources.length > 0) {
      console.log('\n\n📚 Papers in Corpus:');
      console.log('='.repeat(60));
      
      allSources.forEach((source, idx) => {
        const chunkCount = chunkCountMap.get(source.id) || 0;
        const year = source.publishedAt ? new Date(source.publishedAt).getFullYear() : 'N/A';
        const authorStr = source.authors?.join(', ') || 'Unknown';
        const firstAuthor = source.authors?.[0]?.split(',')[0] || 'Unknown';
        
        console.log(`\n[${idx + 1}] ${source.title}`);
        console.log(`    Authors: ${authorStr}`);
        console.log(`    Year: ${year}`);
        console.log(`    Type: ${source.type}`);
        console.log(`    Chunks: ${chunkCount}`);
        console.log(`    Quality: ${source.vettingScore ? (source.vettingScore * 100).toFixed(0) + '%' : 'N/A'}`);
        console.log(`    Added: ${new Date(source.createdAt!).toLocaleDateString()}`);
      });
    }
    
    console.log('\n\n' + '='.repeat(60));
    console.log('💡 Tips:');
    console.log('   - Add more papers: npm run ingest-research');
    console.log('   - Test retrieval: npm run rgrs-test');
    console.log('   - View in app: Generate a framework and see citations!');
    
    console.log('\n✨ Your corpus is ready!');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

showStats();

