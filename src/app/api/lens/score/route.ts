import { NextRequest, NextResponse } from 'next/server';
import { calculateLensScores } from '@/lib/lens/scoring';
import { db, visionEmbeddings, lensEvents } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { content, documentId, documentType } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Starting Lens scoring for user:', userId || 'anonymous');

    // Get user's vision embedding for alignment scoring
    let visionEmbedding: number[] | undefined;
    if (userId) {
      try {
        const embedding = await db
          .select()
          .from(visionEmbeddings)
          .where(eq(visionEmbeddings.userId, userId))
          .limit(1);

        if (embedding.length > 0) {
          try {
            visionEmbedding = JSON.parse(embedding[0].embedding);
            console.log('✅ Vision embedding found for alignment scoring');
          } catch (e) {
            console.warn('⚠️ Failed to parse vision embedding');
          }
        } else {
          console.log('ℹ️ No vision embedding found - using default alignment');
        }
      } catch (dbError) {
        console.warn('⚠️ Database query failed, continuing without vision embedding:', dbError);
        // Continue without vision embedding - alignment will use default score
      }
    }

    // Calculate all lens scores
    const scores = await calculateLensScores(content, visionEmbedding);

    console.log('✅ Lens scoring complete:', {
      clarity: scores.clarity,
      alignment: scores.alignment,
      actionability: scores.actionability,
      overall: scores.overall
    });

    // Log the scoring event
    if (userId && documentId) {
      try {
        await db.insert(lensEvents).values({
          userId,
          documentId,
          sessionId: request.headers.get('x-session-id') || undefined,
          eventType: 'lens_scored',
          metadata: {
            scores: {
              clarity: scores.clarity,
              alignment: scores.alignment,
              actionability: scores.actionability,
              overall: scores.overall
            },
            documentType
          }
        });
        console.log('✅ Lens event logged');
      } catch (e) {
        console.warn('⚠️ Failed to log lens event:', e);
        // Continue even if logging fails
      }
    }

    // Determine badge level
    const badge = getBadgeLevel(scores.overall);

    return NextResponse.json({
      scores,
      badge,
      message: generateScoreMessage(scores)
    });

  } catch (error) {
    console.error('❌ Lens scoring error:', error);
    
    // Provide helpful error message
    let errorMessage = 'Failed to score document';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorDetails.includes('API key')) {
      errorMessage = 'OpenAI API key not configured';
      errorDetails = 'Please set OPENAI_API_KEY in environment variables';
    } else if (errorDetails.includes('database')) {
      errorMessage = 'Database connection failed';
      errorDetails = 'Database might not be configured. Scoring will work without it.';
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

function getBadgeLevel(overall: number): 'gold' | 'silver' | 'bronze' {
  if (overall >= 8) return 'gold';
  if (overall >= 7) return 'silver';
  return 'bronze';
}

function generateScoreMessage(scores: any): string {
  const messages: string[] = [];
  
  if (scores.clarity >= 8) messages.push('Clear');
  if (scores.actionability >= 8) messages.push('actionable');
  if (scores.alignment >= 8) messages.push('well-aligned');

  if (messages.length === 0) {
    // Find the lowest score to suggest improvement
    const lowest = Math.min(scores.clarity, scores.alignment, scores.actionability);
    if (lowest === scores.clarity) {
      return 'Consider adding specific examples to improve clarity';
    } else if (lowest === scores.alignment) {
      return 'Link to your vision to improve alignment';
    } else {
      return 'Add concrete next steps to improve actionability';
    }
  }

  return messages.join(', ');
}

