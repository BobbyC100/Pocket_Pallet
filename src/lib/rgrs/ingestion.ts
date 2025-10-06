/**
 * RGRS Ingestion Pipeline
 * Processes research papers into chunks, embeddings, and facts
 */

import OpenAI from 'openai';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { sources, chunks, facts, type NewSource, type NewChunk, type NewFact } from '../db/schema';

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

// Token estimation (rough: 1 token ≈ 4 chars)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Hash content for deduplication
function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Chunk text into ~1k token segments with overlap
 */
export function chunkText(
  text: string, 
  targetTokens = 1000, 
  overlap = 100
): { content: string; tokens: number; section?: string }[] {
  // Split by sections first (common academic paper structure)
  const sectionRegex = /^(#{1,3}\s+.+|(?:Abstract|Introduction|Methods|Results|Discussion|Conclusion|References|Findings|Implications)[\s:]+)/gim;
  
  // For now, simple paragraph-based chunking
  // TODO: Enhance with section-aware chunking in Phase 2
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  const result: { content: string; tokens: number; section?: string }[] = [];
  let currentChunk = '';
  let currentTokens = 0;
  let currentSection: string | undefined = undefined;
  
  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);
    
    // Check if this paragraph is a section header
    const sectionMatch = para.match(sectionRegex);
    if (sectionMatch) {
      currentSection = sectionMatch[0].trim();
    }
    
    if (currentTokens + paraTokens > targetTokens && currentChunk) {
      // Save current chunk
      result.push({
        content: currentChunk.trim(),
        tokens: currentTokens,
        section: currentSection,
      });
      
      // Start new chunk with overlap
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-overlap);
      currentChunk = overlapWords.join(' ') + '\n\n' + para;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
      currentTokens += paraTokens;
    }
  }
  
  // Save last chunk
  if (currentChunk.trim()) {
    result.push({
      content: currentChunk.trim(),
      tokens: currentTokens,
      section: currentSection,
    });
  }
  
  return result;
}

/**
 * Generate embeddings for text chunks
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const openai = getOpenAI();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // 1536 dimensions
      input: texts,
    });
    
    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Extract facts (subject-predicate-object triples) from text
 * Uses zero-shot LLM prompting
 */
export async function extractFacts(
  content: string,
  sourceId: string,
  chunkId: string
): Promise<Omit<NewFact, 'createdAt'>[]> {
  const prompt = `You are a research fact extractor. Extract key findings as subject-predicate-object triples from this text.

Focus on relationships relevant to organizational science: alignment, goal_congruence, role_clarity, engagement, performance, voice_safety, psychological_safety, etc.

**Text:**
${content}

**Return JSON array of facts:**
\`\`\`json
[
  {
    "subject": "goal_congruence",
    "predicate": "increases",
    "object": "employee_engagement",
    "evidence": "Direct quote or paraphrase from text",
    "confidence": 0.9
  }
]
\`\`\`

Return only the JSON array, no other text.`;

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    
    const text = response.choices[0]?.message?.content || '{"facts": []}';
    const parsed = JSON.parse(text);
    const factsList = parsed.facts || parsed; // Handle both {facts: [...]} and [...]
    
    return (Array.isArray(factsList) ? factsList : []).map((fact: any) => ({
      sourceId,
      chunkId,
      subject: fact.subject,
      predicate: fact.predicate,
      object: fact.object,
      evidence: fact.evidence,
      confidence: fact.confidence || 0.5,
      verified: false,
    }));
  } catch (error) {
    console.error('Error extracting facts:', error);
    return [];
  }
}

/**
 * Ingest a research source (paper, article, etc.)
 */
export async function ingestSource(params: {
  title: string;
  type: 'paper' | 'article' | 'book' | 'report' | 'thesis';
  authors?: string[];
  url?: string;
  publishedAt?: Date;
  vettingScore?: number;
  content: string; // Full text content
  metadata?: Record<string, any>;
  extractFactsEnabled?: boolean; // Set to false to skip fact extraction
}): Promise<{
  sourceId: string;
  chunksCreated: number;
  factsExtracted: number;
}> {
  const {
    title,
    type,
    authors,
    url,
    publishedAt,
    vettingScore,
    content,
    metadata,
    extractFactsEnabled = true,
  } = params;
  
  console.log(`📄 Ingesting source: ${title}`);
  
  // Check for duplicates
  const contentHash = hashContent(content);
  const existingSource = await db.select().from(sources).where(eq(sources.hash, contentHash)).limit(1);
  
  if (existingSource.length > 0) {
    console.log(`⚠️  Source already exists (hash match): ${existingSource[0].id}`);
    return {
      sourceId: existingSource[0].id,
      chunksCreated: 0,
      factsExtracted: 0,
    };
  }
  
  // Create source
  const [source] = await db.insert(sources).values({
    title,
    type,
    authors,
    url,
    publishedAt,
    vettingScore,
    hash: contentHash,
    metadata,
  }).returning();
  
  console.log(`✅ Source created: ${source.id}`);
  
  // Chunk the content
  const textChunks = chunkText(content);
  console.log(`📝 Created ${textChunks.length} chunks`);
  
  // Generate embeddings in batches (OpenAI limit: 2048 inputs per request)
  const batchSize = 100;
  const allEmbeddings: number[][] = [];
  
  for (let i = 0; i < textChunks.length; i += batchSize) {
    const batch = textChunks.slice(i, i + batchSize);
    const batchTexts = batch.map(c => c.content);
    const embeddings = await generateEmbeddings(batchTexts);
    allEmbeddings.push(...embeddings);
    console.log(`🔢 Generated embeddings for chunks ${i + 1}-${Math.min(i + batchSize, textChunks.length)}`);
  }
  
  // Insert chunks with embeddings
  const insertedChunks = await db.insert(chunks).values(
    textChunks.map((chunk, idx) => ({
      sourceId: source.id,
      ord: idx,
      content: chunk.content,
      tokens: chunk.tokens,
      section: chunk.section,
      embedding: allEmbeddings[idx], // pgvector stores as array
    }))
  ).returning();
  
  console.log(`✅ Inserted ${insertedChunks.length} chunks with embeddings`);
  
  // Extract facts (optional, can be slow)
  let totalFacts = 0;
  if (extractFactsEnabled) {
    console.log(`🔍 Extracting facts from chunks...`);
    
    for (const chunk of insertedChunks) {
      const extractedFacts = await extractFacts(chunk.content, source.id, chunk.id);
      
      if (extractedFacts.length > 0) {
        await db.insert(facts).values(extractedFacts);
        totalFacts += extractedFacts.length;
        console.log(`  ✓ Chunk ${chunk.ord}: ${extractedFacts.length} facts`);
      }
    }
    
    console.log(`✅ Extracted ${totalFacts} total facts`);
  } else {
    console.log(`⏭️  Fact extraction skipped`);
  }
  
  return {
    sourceId: source.id,
    chunksCreated: insertedChunks.length,
    factsExtracted: totalFacts,
  };
}

/**
 * Ingest from plain text
 * Useful for starting with excerpts before building full PDF parser
 */
export async function ingestFromText(
  title: string,
  authors: string[],
  content: string,
  options?: {
    type?: 'paper' | 'article' | 'book' | 'report' | 'thesis';
    url?: string;
    publishedAt?: Date;
    vettingScore?: number;
    metadata?: Record<string, any>;
    extractFacts?: boolean;
  }
): Promise<{
  sourceId: string;
  chunksCreated: number;
  factsExtracted: number;
}> {
  return ingestSource({
    title,
    type: options?.type || 'paper',
    authors,
    url: options?.url,
    publishedAt: options?.publishedAt,
    vettingScore: options?.vettingScore,
    content,
    metadata: options?.metadata,
    extractFactsEnabled: options?.extractFacts,
  });
}

