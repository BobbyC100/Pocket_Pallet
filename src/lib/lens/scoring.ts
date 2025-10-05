/**
 * Founder's Lens - Base Lens Scoring
 * Calculates Clarity, Alignment, and Actionability scores
 */

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-will-fail',
});

export interface LensScores {
  clarity: number;
  alignment: number;
  actionability: number;
  overall: number;
  feedback: {
    clarity?: string;
    alignment?: string;
    actionability?: string;
  };
}

/**
 * Calculate Clarity score (1-10)
 * Measures: readability, specificity, concrete language
 */
export async function calculateClarity(content: string): Promise<{ score: number; feedback?: string }> {
  const prompt = `Rate this document's CLARITY on a scale of 1-10.

**Clarity Criteria:**
- Plain language, minimal jargon
- Specific examples and concrete details
- Clear structure and flow
- Unambiguous intent

**Document:**
${content.substring(0, 2000)}

Return JSON: { "score": <1-10>, "feedback": "<one sentence on how to improve>" }
If score is 8+, feedback can be omitted or brief.`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(result.choices[0]?.message?.content || '{"score": 7}');
    return {
      score: response.score || 7,
      feedback: response.feedback
    };
  } catch (error) {
    console.error('Clarity scoring error:', error);
    return { score: 7 }; // Neutral fallback
  }
}

/**
 * Calculate Actionability score (1-10)
 * Measures: presence of next steps, specificity of actions, clear owners/dates
 */
export async function calculateActionability(content: string): Promise<{ score: number; feedback?: string }> {
  const prompt = `Rate this document's ACTIONABILITY on a scale of 1-10.

**Actionability Criteria:**
- Clear next steps or calls-to-action
- Specific, implementable recommendations
- Owners, timelines, or measurable outcomes mentioned
- Prioritization or sequence indicated

**Document:**
${content.substring(0, 2000)}

Return JSON: { "score": <1-10>, "feedback": "<one sentence on how to improve>" }
If score is 8+, feedback can be omitted or brief.`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(result.choices[0]?.message?.content || '{"score": 7}');
    return {
      score: response.score || 7,
      feedback: response.feedback
    };
  } catch (error) {
    console.error('Actionability scoring error:', error);
    return { score: 7 };
  }
}

/**
 * Calculate Alignment score (1-10)
 * Uses semantic similarity to user's vision embedding
 */
export async function calculateAlignment(
  content: string, 
  visionEmbedding?: number[]
): Promise<{ score: number; feedback?: string }> {
  if (!visionEmbedding) {
    // No vision embedding yet - return neutral score
    return {
      score: 7,
      feedback: "Create your vision document to enable alignment scoring."
    };
  }

  try {
    // Get embedding for current document
    const embeddingResult = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content.substring(0, 8000), // Token limit
    });

    const docEmbedding = embeddingResult.data[0].embedding;

    // Calculate cosine similarity
    const similarity = cosineSimilarity(visionEmbedding, docEmbedding);

    // Map similarity to score
    let score: number;
    let feedback: string | undefined;

    if (similarity >= 0.85) {
      score = 9;
    } else if (similarity >= 0.70) {
      score = 7.5;
    } else if (similarity >= 0.50) {
      score = 5.5;
      feedback = "This document diverges from your stated vision. Consider linking key points back to your core strategy.";
    } else {
      score = 4;
      feedback = "Significant drift from your vision detected. Ensure this aligns with your long-term goals or update your vision if priorities have shifted.";
    }

    return { score, feedback };
  } catch (error) {
    console.error('Alignment scoring error:', error);
    return { score: 7 };
  }
}

/**
 * Calculate all lens scores
 */
export async function calculateLensScores(
  content: string,
  visionEmbedding?: number[]
): Promise<LensScores> {
  console.log('🔍 Starting lens scoring with content length:', content.length);
  
  if (!content || content.trim().length === 0) {
    console.warn('⚠️ Empty content provided for scoring');
    throw new Error('Content cannot be empty');
  }

  try {
    // Run all scorers in parallel with individual error handling
    const [clarity, actionability, alignment] = await Promise.all([
      calculateClarity(content).catch(err => {
        console.error('Clarity scoring failed:', err);
        return { score: 7, feedback: 'Clarity scoring unavailable' };
      }),
      calculateActionability(content).catch(err => {
        console.error('Actionability scoring failed:', err);
        return { score: 7, feedback: 'Actionability scoring unavailable' };
      }),
      calculateAlignment(content, visionEmbedding).catch(err => {
        console.error('Alignment scoring failed:', err);
        return { score: 7, feedback: 'Alignment scoring unavailable' };
      })
    ]);

    const overall = (clarity.score + actionability.score + alignment.score) / 3;

    console.log('✅ All scorers completed:', {
      clarity: clarity.score,
      actionability: actionability.score,
      alignment: alignment.score,
      overall: overall.toFixed(1)
    });

    return {
      clarity: clarity.score,
      alignment: alignment.score,
      actionability: actionability.score,
      overall: Math.round(overall * 10) / 10,
      feedback: {
        clarity: clarity.feedback,
        alignment: alignment.feedback,
        actionability: actionability.feedback
      }
    };
  } catch (error) {
    console.error('❌ Fatal error in calculateLensScores:', error);
    throw error;
  }
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Create or update vision embedding for a user
 */
export async function createVisionEmbedding(visionText: string): Promise<number[]> {
  const embeddingResult = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: visionText,
  });

  return embeddingResult.data[0].embedding;
}

