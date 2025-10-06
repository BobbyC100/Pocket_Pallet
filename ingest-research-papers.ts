/**
 * Ingest Core Research Papers
 * Adds Nishii (2016) and Tosti & Jackson (2000) to the corpus
 */

// Load environment variables FIRST before any other imports
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as fs from 'fs/promises';
import * as path from 'path';

async function ingestCoreResearch() {
  console.log('📚 Ingesting Core Research Papers\n');
  console.log('='.repeat(60));
  
  // Dynamically import after dotenv loads
  const { ingestFromText } = await import('./src/lib/rgrs/ingestion');
  
  try {
    // Paper 1: Nishii et al. (2016)
    console.log('\n📄 Paper 1: Nishii et al. (2016)');
    console.log('-'.repeat(60));
    
    const nishiiPath = path.join(process.cwd(), 'research-papers', 'nishii-2016-excerpt.txt');
    const nishiiContent = await fs.readFile(nishiiPath, 'utf-8');
    
    const nishiiResult = await ingestFromText(
      'The Human Side of Strategy: Employee Experiences of Strategic Alignment',
      ['Nishii, L. H.', 'Khattab, J.', 'Shemla, M.', 'Paluch, R. M.'],
      nishiiContent,
      {
        type: 'paper',
        publishedAt: new Date('2016-01-01'),
        vettingScore: 0.95, // Peer-reviewed, highly cited
        metadata: {
          journal: 'Strategic Management Journal',
          year: 2016,
          keywords: ['strategic alignment', 'employee experience', 'strategy execution', 'HR systems', 'leader behavior'],
          abstract: 'Examines how employees experience strategy through alignment between espoused, enacted, and reinforced strategy'
        },
        extractFacts: false, // Skip for speed (can enable later)
      }
    );
    
    console.log('\n✅ Nishii (2016) ingested:');
    console.log(`   Source ID: ${nishiiResult.sourceId}`);
    console.log(`   Chunks: ${nishiiResult.chunksCreated}`);
    console.log(`   Facts: ${nishiiResult.factsExtracted}`);
    
    // Paper 2: Tosti & Jackson (2000)
    console.log('\n\n📄 Paper 2: Tosti & Jackson (2000)');
    console.log('-'.repeat(60));
    
    const tostiPath = path.join(process.cwd(), 'research-papers', 'tosti-jackson-2000-excerpt.txt');
    const tostiContent = await fs.readFile(tostiPath, 'utf-8');
    
    const tostiResult = await ingestFromText(
      'Organizational Alignment: The 7 Clear Performance Practices',
      ['Tosti, D. T.', 'Jackson, S. F.'],
      tostiContent,
      {
        type: 'article',
        publishedAt: new Date('2000-01-01'),
        vettingScore: 0.90, // Foundational work in organizational alignment
        metadata: {
          journal: 'Performance Improvement Journal',
          year: 2000,
          keywords: ['organizational alignment', 'performance', 'strategic clarity', 'cultural alignment', 'goal coherence'],
          abstract: 'Presents framework for organizational alignment with seven practices for creating and maintaining alignment'
        },
        extractFacts: false, // Skip for speed
      }
    );
    
    console.log('\n✅ Tosti & Jackson (2000) ingested:');
    console.log(`   Source ID: ${tostiResult.sourceId}`);
    console.log(`   Chunks: ${tostiResult.chunksCreated}`);
    console.log(`   Facts: ${tostiResult.factsExtracted}`);
    
    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('🎉 INGESTION COMPLETE!');
    console.log('='.repeat(60));
    
    const totalChunks = nishiiResult.chunksCreated + tostiResult.chunksCreated;
    const totalFacts = nishiiResult.factsExtracted + tostiResult.factsExtracted;
    
    console.log('\n📊 Summary:');
    console.log(`   Papers ingested: 2`);
    console.log(`   Total chunks: ${totalChunks}`);
    console.log(`   Total facts: ${totalFacts}`);
    console.log(`   Research corpus size: 3 papers (Dalain + Nishii + Tosti)`);
    
    console.log('\n🎯 Your RGRS corpus now includes:');
    console.log('   1. Dalain (2023) - Goal Congruence & Employee Engagement');
    console.log('   2. Nishii et al. (2016) - Strategy-Culture-HR Alignment');
    console.log('   3. Tosti & Jackson (2000) - Organizational Alignment Practices');
    
    console.log('\n💡 Impact:');
    console.log('   - Broader topic coverage (strategy execution, culture, HR)');
    console.log('   - Higher chance of finding relevant citations');
    console.log('   - Richer research context for AI prompts');
    
    console.log('\n🧪 Test it:');
    console.log('   1. Go to /new in your app');
    console.log('   2. Generate a framework');
    console.log('   3. You should now see citations from multiple papers!');
    
    console.log('\n✨ Next steps:');
    console.log('   - Add more papers as you find them');
    console.log('   - Enable fact extraction for deeper insights (extractFacts: true)');
    console.log('   - Build BAI v1 scoring with this rich research base');
    
  } catch (error) {
    console.error('\n❌ Ingestion failed:', error);
    console.error(error);
    process.exit(1);
  }
}

ingestCoreResearch();

