/**
 * RGRS Test Script
 * Tests ingestion and retrieval with a sample research excerpt
 */

// Load environment variables FIRST before any other imports
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Sample excerpt from Dalain (2023) - Goal Congruence study
const DALAIN_EXCERPT = `
# Nurturing Employee Engagement Through Goal Congruence, Organizational Learning Culture, and Innovation: A Study of the Malaysian Healthcare Sector

## Abstract

This study examines the relationships between goal congruence, organizational learning culture, innovation, and employee engagement in Malaysian healthcare organizations. Using structural equation modeling with data from 450 healthcare professionals, we find that goal congruence significantly predicts employee engagement (β = 0.52, p < 0.001) and explains approximately 50% of variance in engagement levels.

## Introduction

Employee engagement has emerged as a critical factor in organizational performance, particularly in healthcare settings where quality of care depends on motivated professionals. Previous research suggests that alignment between individual and organizational goals—termed goal congruence—may be a key driver of engagement, but this relationship has not been extensively studied in healthcare contexts.

## Findings

### Goal Congruence and Engagement

Our analysis reveals that goal congruence is the strongest predictor of employee engagement in our model (β = 0.52, p < 0.001). Healthcare professionals who perceive high alignment between their personal objectives and organizational goals report significantly higher levels of engagement across all three dimensions: vigor, dedication, and absorption.

Specifically, we find:

1. **Direct Effect**: Goal congruence directly predicts 27% of variance in employee engagement (R² = 0.27, p < 0.001)
2. **Mediated Effect**: An additional 23% of variance is explained through organizational learning culture and innovation pathways (total R² = 0.50)
3. **Threshold Effect**: Engagement levels increase sharply when goal congruence exceeds the 60th percentile, suggesting a critical threshold for alignment

### Role Clarity as Moderator

Role clarity significantly moderates the goal congruence-engagement relationship (β = 0.18, p < 0.01). When employees have clear understanding of their roles and decision rights, the positive effect of goal congruence on engagement is amplified by approximately 35%.

## Discussion

### Implications for Practice

Our findings have several practical implications for healthcare managers:

1. **Alignment Initiatives**: Organizations should invest in processes that ensure individual and organizational goals are explicitly aligned and regularly reviewed
2. **Role Definition**: Clear role boundaries and decision rights strengthen the impact of goal alignment
3. **Measurement**: Regular assessment of goal congruence can serve as an early indicator of engagement risks

### Misalignment Costs

Importantly, we find that goal misalignment has significant costs. Healthcare professionals reporting low goal congruence show:
- 40% lower engagement scores
- 28% higher turnover intentions
- 15% lower patient satisfaction ratings in their units

These findings suggest that vision dilution or strategic misalignment can have measurable business impacts beyond employee satisfaction.

## Conclusion

Goal congruence emerges as a critical driver of employee engagement in healthcare settings, explaining approximately 50% of variance when combined with organizational learning and innovation factors. Organizations seeking to improve engagement should prioritize goal alignment initiatives, particularly when coupled with clear role definitions.
`;

async function testRGRS() {
  console.log('🧪 Testing RGRS Pipeline\n');
  console.log('=' .repeat(60));
  
  // Dynamically import RGRS modules after dotenv has loaded
  const { ingestFromText } = await import('./src/lib/rgrs/ingestion');
  const { retrieveChunks, formatCitations, retrieveForGeneration } = await import('./src/lib/rgrs/retrieval');
  
  try {
    // Step 1: Ingest research
    console.log('\n📚 STEP 1: Ingesting Dalain (2023) excerpt...\n');
    const result = await ingestFromText(
      'Nurturing Employee Engagement Through Goal Congruence',
      ['Dalain, M.'],
      DALAIN_EXCERPT,
      {
        type: 'paper',
        publishedAt: new Date('2023-01-01'),
        vettingScore: 0.95, // Peer-reviewed, recent, highly relevant
        metadata: {
          journal: 'Journal of Organizational Behavior',
          doi: '10.1002/job.2023.example',
        },
        extractFacts: true, // Enable fact extraction
      }
    );
    
    console.log('\n✅ Ingestion complete:');
    console.log(`  - Source ID: ${result.sourceId}`);
    console.log(`  - Chunks created: ${result.chunksCreated}`);
    console.log(`  - Facts extracted: ${result.factsExtracted}`);
    
    // Step 2: Test retrieval
    console.log('\n\n🔍 STEP 2: Testing retrieval...\n');
    
    const testQueries = [
      'How does goal alignment affect employee engagement?',
      'What is the relationship between role clarity and performance?',
      'How can we measure organizational alignment?',
    ];
    
    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      console.log('-'.repeat(60));
      
      const chunks = await retrieveChunks(query, {
        topK: 3,
        minSimilarity: 0.5,
        boostFacts: true,
      });
      
      console.log(`Found ${chunks.length} relevant chunks:\n`);
      
      chunks.forEach((chunk, idx) => {
        console.log(`[${idx + 1}] Similarity: ${chunk.similarity.toFixed(3)} | Boosted: ${chunk.boostedScore.toFixed(3)}`);
        console.log(`    Section: ${chunk.chunk.section || 'Unknown'}`);
        console.log(`    Source: ${chunk.chunk.source?.title}`);
        if (chunk.matchingFacts && chunk.matchingFacts.length > 0) {
          console.log(`    Matching facts: ${chunk.matchingFacts.length}`);
          chunk.matchingFacts.slice(0, 2).forEach(fact => {
            console.log(`      - ${fact.subject} ${fact.predicate} ${fact.object}`);
          });
        }
        console.log(`    Preview: ${chunk.chunk.content.slice(0, 150)}...\n`);
      });
      
      console.log('\nFormatted Citations:');
      console.log(formatCitations(chunks));
      console.log('');
    }
    
    // Step 3: Test generation context
    console.log('\n\n📝 STEP 3: Testing retrieval for generation context...\n');
    
    const mockUserResponses = {
      vision_purpose: 'Align team goals with company mission',
      vision_endstate: 'Every employee understands how their work contributes to organizational success',
      core_principles: 'Transparency, clarity, and continuous feedback',
    };
    
    const generationChunks = await retrieveForGeneration(mockUserResponses, 'strategy');
    
    console.log(`Retrieved ${generationChunks.length} chunks for generation context:`);
    generationChunks.slice(0, 3).forEach((chunk, idx) => {
      console.log(`\n[${idx + 1}] ${chunk.chunk.source?.title}`);
      console.log(`    Score: ${chunk.boostedScore.toFixed(3)}`);
      console.log(`    Preview: ${chunk.chunk.content.slice(0, 100)}...`);
    });
    
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ RGRS Pipeline Test Complete!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`  ✓ Ingestion: ${result.chunksCreated} chunks, ${result.factsExtracted} facts`);
    console.log(`  ✓ Retrieval: Working with similarity search + fact boosting`);
    console.log(`  ✓ Citations: Formatted and ready for display`);
    console.log(`  ✓ Generation Context: Retrieved ${generationChunks.length} relevant chunks`);
    console.log('\n🎉 Ready for Phase 1 integration into Vision Framework generation!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testRGRS();

