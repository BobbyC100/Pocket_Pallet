/**
 * Reference Retrieval API
 * Finds supporting/contradicting passages from research for a given claim
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { chunks, sources } from '@/lib/db/schema';
import { sql, desc } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RequestSchema = z.object({
  claimText: z.string().min(8),
  topK: z.number().min(1).max(10).default(5),
  minSimilarity: z.number().min(0).max(1).default(0.25),
});

export type ReferencePassage = {
  id: string;
  paperId: string;
  paperTitle: string;
  url?: string;
  snippet: string;
  score: number;
  location?: string;
  stance: 'supports' | 'conflicts' | 'neutral';
  section?: string;
};

/**
 * POST /api/references
 * Retrieves research passages similar to a claim
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claimText, topK, minSimilarity } = RequestSchema.parse(body);

    console.log(`[references] Searching for: "${claimText.substring(0, 60)}..."`);

    // Step 1: Generate embedding for claim
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: claimText,
      encoding_format: 'float',
    });

    const claimEmbedding = embeddingResponse.data[0].embedding;
    const embeddingString = `[${claimEmbedding.join(',')}]`;

    // Step 2: Vector similarity search using pgvector
    const results = await db
      .select({
        chunkId: chunks.id,
        chunkContent: chunks.content,
        chunkSection: chunks.section,
        sourceId: sources.id,
        sourceTitle: sources.title,
        sourceUrl: sources.url,
        sourceAuthors: sources.authors,
        similarity: sql<number>`1 - (${chunks.embedding} <=> ${embeddingString}::vector)`,
      })
      .from(chunks)
      .innerJoin(sources, sql`${chunks.sourceId} = ${sources.id}`)
      .where(sql`1 - (${chunks.embedding} <=> ${embeddingString}::vector) >= ${minSimilarity}`)
      .orderBy(desc(sql`1 - (${chunks.embedding} <=> ${embeddingString}::vector)`))
      .limit(topK);

    console.log(`[references] Found ${results.length} passages above threshold ${minSimilarity}`);

    // Step 3: Determine stance for each passage
    const stanceOf = (snippet: string): 'supports' | 'conflicts' | 'neutral' => {
      const lower = snippet.toLowerCase();
      // Keywords suggesting conflict
      if (
        lower.includes('contradict') ||
        lower.includes('however,') ||
        lower.includes('in contrast') ||
        lower.includes('disagree') ||
        lower.includes('opposes')
      ) {
        return 'conflicts';
      }
      // Keywords suggesting support
      if (
        lower.includes('evidence') ||
        lower.includes('supports') ||
        lower.includes('consistent with') ||
        lower.includes('confirms') ||
        lower.includes('validates') ||
        lower.includes('demonstrates')
      ) {
        return 'supports';
      }
      return 'neutral';
    };

    // Step 4: Format references
    const references: ReferencePassage[] = results.map((r) => ({
      id: r.chunkId,
      paperId: r.sourceId,
      paperTitle: r.sourceTitle,
      url: r.sourceUrl ?? undefined,
      snippet: r.chunkContent.substring(0, 300) + (r.chunkContent.length > 300 ? '...' : ''),
      score: Number(r.similarity.toFixed(3)),
      location: undefined, // Page numbers not currently stored
      stance: stanceOf(r.chunkContent),
      section: r.chunkSection ?? undefined,
    }));

    return NextResponse.json({ references });
  } catch (error: any) {
    console.error('[references] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message ?? 'Failed to fetch references' },
      { status: 500 }
    );
  }
}

