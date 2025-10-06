/**
 * RGRS Retrieval Engine
 * Similarity search with fact boosting and section filtering
 */

import OpenAI from 'openai';
import { sql, desc, and, inArray, or } from 'drizzle-orm';
import { db } from '../db';
import { chunks, facts, sources, type Chunk } from '../db/schema';

// Lazy-load OpenAI client
let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Key concepts to boost in retrieval
const BOOST_CONCEPTS = new Set([
  'alignment',
  'goal_congruence',
  'role_clarity',
  'metric_coherence',
  'voice_safety',
  'psychological_safety',
  'engagement',
  'performance',
  'strategy',
  'culture',
]);

// Section priorities (higher = better)
const SECTION_WEIGHTS: Record<string, number> = {
  'Findings': 2.0,
  'Discussion': 1.8,
  'Results': 1.8,
  'Implications': 1.5,
  'Conclusion': 1.3,
  'Methods': 0.8,
  'Introduction': 0.6,
  'Abstract': 0.5,
  'References': 0.1,
};

export interface RetrievalResult {
  chunk: Chunk & { source?: { title: string; authors?: string[]; url?: string } };
  similarity: number;
  boostedScore: number;
  matchingFacts?: Array<{
    subject: string;
    predicate: string;
    object: string;
    evidence?: string;
    confidence?: number;
  }>;
}

/**
 * Generate embedding for a query
 */
async function embedQuery(query: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  return response.data[0].embedding;
}

/**
 * Calculate boosted score based on facts and section
 */
function calculateBoostedScore(
  similarity: number,
  chunk: any,
  matchingFacts: number
): number {
  let score = similarity;
  
  // Boost by matching facts
  score += matchingFacts * 0.1; // +0.1 per matching fact
  
  // Boost/demote by section
  if (chunk.section) {
    const sectionWeight = SECTION_WEIGHTS[chunk.section] || 1.0;
    score *= sectionWeight;
  }
  
  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Retrieve relevant chunks for a query
 */
export async function retrieveChunks(
  query: string,
  options?: {
    topK?: number;
    minSimilarity?: number;
    boostFacts?: boolean;
    filterSections?: string[]; // Only include these sections
  }
): Promise<RetrievalResult[]> {
  const {
    topK = 12,
    minSimilarity = 0.5,
    boostFacts = true,
    filterSections,
  } = options || {};
  
  console.log(`🔍 Retrieving chunks for query: "${query.slice(0, 100)}..."`);
  
  // Generate query embedding
  const queryEmbedding = await embedQuery(query);
  
  // Perform vector similarity search with pgvector
  // Using cosine distance: <=> operator
  const similarityQuery = sql`1 - (${chunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`;
  
  // Build where conditions
  const whereConditions = [sql`${similarityQuery} > ${minSimilarity}`];
  
  if (filterSections && filterSections.length > 0) {
    whereConditions.push(inArray(chunks.section, filterSections));
  }
  
  const selectQuery = db
    .select({
      id: chunks.id,
      sourceId: chunks.sourceId,
      ord: chunks.ord,
      content: chunks.content,
      tokens: chunks.tokens,
      section: chunks.section,
      embedding: chunks.embedding,
      createdAt: chunks.createdAt,
      similarity: similarityQuery.as('similarity'),
      sourceTitle: sources.title,
      sourceAuthors: sources.authors,
      sourceUrl: sources.url,
    })
    .from(chunks)
    .leftJoin(sources, sql`${chunks.sourceId} = ${sources.id}`)
    .where(and(...whereConditions))
    .orderBy(desc(similarityQuery))
    .limit(topK * 2); // Get more initially for reranking
  
  const results = await selectQuery;
  
  console.log(`  Found ${results.length} chunks above similarity ${minSimilarity}`);
  
  // Get matching facts for each chunk (if boosting enabled)
  const enrichedResults: RetrievalResult[] = [];
  
  for (const result of results) {
    let matchingFacts: any[] = [];
    
    if (boostFacts) {
      // Find facts from this chunk that touch boost concepts
      const chunkFacts = await db
        .select()
        .from(facts)
        .where(
          and(
            sql`${facts.chunkId} = ${result.id}`,
            or(
              ...Array.from(BOOST_CONCEPTS).map(concept =>
                or(
                  sql`${facts.subject} ILIKE ${`%${concept}%`}`,
                  sql`${facts.object} ILIKE ${`%${concept}%`}`
                )
              )
            )
          )
        );
      
      matchingFacts = chunkFacts.map(f => ({
        subject: f.subject,
        predicate: f.predicate,
        object: f.object,
        evidence: f.evidence || undefined,
        confidence: f.confidence || undefined,
      }));
    }
    
    const boostedScore = calculateBoostedScore(
      Number(result.similarity),
      result,
      matchingFacts.length
    );
    
    enrichedResults.push({
      chunk: {
        id: result.id,
        sourceId: result.sourceId,
        ord: result.ord,
        content: result.content,
        tokens: result.tokens,
        section: result.section ?? null,
        embedding: result.embedding,
        createdAt: new Date(result.createdAt),
        source: {
          title: result.sourceTitle || 'Unknown',
          authors: result.sourceAuthors ?? undefined,
          url: result.sourceUrl ?? undefined,
        },
      },
      similarity: Number(result.similarity),
      boostedScore,
      matchingFacts: matchingFacts.length > 0 ? matchingFacts : undefined,
    });
  }
  
  // Sort by boosted score and take topK
  enrichedResults.sort((a, b) => b.boostedScore - a.boostedScore);
  const topResults = enrichedResults.slice(0, topK);
  
  console.log(`  ✓ Returning top ${topResults.length} chunks (boosted)`);
  
  return topResults;
}

/**
 * Retrieve chunks for a document being generated
 * Optimized for framework generation context
 */
export async function retrieveForGeneration(
  userResponses: Record<string, any>,
  section?: string
): Promise<RetrievalResult[]> {
  // Build a rich query from user responses
  const queryParts: string[] = [];
  
  if (userResponses.vision_purpose) {
    queryParts.push(`Vision: ${userResponses.vision_purpose}`);
  }
  if (userResponses.vision_endstate) {
    queryParts.push(`End state: ${userResponses.vision_endstate}`);
  }
  if (userResponses.core_principles) {
    queryParts.push(`Principles: ${userResponses.core_principles}`);
  }
  
  // Add section-specific context
  if (section) {
    queryParts.push(`Guidance for ${section} section`);
  }
  
  const query = queryParts.join('. ');
  
  // Prefer Findings, Discussion, Implications
  const preferredSections = ['Findings', 'Discussion', 'Implications', 'Results', 'Conclusion'];
  
  return retrieveChunks(query, {
    topK: 8,
    minSimilarity: 0.3, // Lowered for demo (was 0.6) - shows citations even for unrelated topics
    boostFacts: true,
    filterSections: undefined, // Don't hard-filter, let boosting handle it
  });
}

/**
 * Format citations for display
 */
export function formatCitations(results: RetrievalResult[]): string {
  if (results.length === 0) return '';
  
  const citations = results
    .filter(r => r.chunk.source)
    .map((r, idx) => {
      const source = r.chunk.source!;
      const authors = source.authors?.join(', ') || 'Unknown';
      const title = source.title;
      const section = r.chunk.section || 'Section';
      return `[${idx + 1}] ${authors}. "${title}" (${section}, similarity: ${r.similarity.toFixed(2)})`;
    });
  
  return citations.join('\n');
}

/**
 * Get citation metadata for a chunk
 */
export function getCitation(result: RetrievalResult): {
  authors?: string;
  title: string;
  section?: string;
  url?: string;
  confidence: number;
} {
  const source = result.chunk.source;
  return {
    authors: source?.authors?.join(', '),
    title: source?.title || 'Unknown Source',
    section: result.chunk.section ?? undefined,
    url: source?.url,
    confidence: result.similarity,
  };
}

