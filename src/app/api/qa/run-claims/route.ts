/**
 * Batch Claim Validation API
 * Validates multiple claims against research corpus
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ReferencePassage } from '@/app/api/references/route';

const ClaimSchema = z.object({
  id: z.string(),
  text: z.string().min(8),
  section: z.enum(['vision', 'strategy', 'risk', 'metrics', 'other']).optional(),
});

const RequestSchema = z.object({
  claims: z.array(ClaimSchema),
  topK: z.number().min(1).max(10).default(5),
  minSimilarity: z.number().min(0).max(1).default(0.25),
  passThreshold: z.number().min(0).max(1).default(0.25),
});

export type QAClaimCheck = {
  claimId: string;
  pass: boolean;
  issues: string[];
  references: ReferencePassage[];
};

/**
 * POST /api/qa/run-claims
 * Batch validation of claims against research
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claims, topK, minSimilarity, passThreshold } = RequestSchema.parse(body);

    console.log(`[qa/run-claims] Validating ${claims.length} claims`);

    const checks: QAClaimCheck[] = [];

    // Process claims sequentially (could be parallelized for better performance)
    for (const claim of claims) {
      try {
        // Call the references API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/references`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claimText: claim.text,
            topK,
            minSimilarity,
          }),
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`References API returned ${response.status}`);
        }

        const data = await response.json();
        const references = (data.references || []) as ReferencePassage[];

        // Determine if claim passes
        const bestScore = references.length > 0 ? references[0].score : 0;
        const pass = bestScore >= passThreshold;

        const issues: string[] = [];
        if (!pass) {
          if (references.length === 0) {
            issues.push('No similar evidence found in research corpus.');
          } else {
            issues.push(
              `Evidence similarity (${bestScore.toFixed(2)}) below threshold (${passThreshold.toFixed(2)}).`
            );
          }
        }

        checks.push({
          claimId: claim.id,
          pass,
          issues,
          references,
        });
      } catch (error: any) {
        console.error(`[qa/run-claims] Error validating claim ${claim.id}:`, error);
        checks.push({
          claimId: claim.id,
          pass: false,
          issues: [`Validation failed: ${error.message}`],
          references: [],
        });
      }
    }

    console.log(
      `[qa/run-claims] Complete: ${checks.filter((c) => c.pass).length}/${checks.length} passed`
    );

    return NextResponse.json({ checks });
  } catch (error: any) {
    console.error('[qa/run-claims] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message ?? 'QA batch validation failed' },
      { status: 500 }
    );
  }
}

