import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createExecutiveOnePagerPrompt } from '@/lib/vision-framework-schema-v2';
import { calculateCost, trackCost } from '@/lib/cost-tracker';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/vision-framework-v2/generate-onepager
 * Generate Executive One-Pager on-demand
 * 
 * Optimized: Only generates when user clicks the tab
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('X-Request-ID') || crypto.randomUUID();

  try {
    const { framework, userId, anonymousId } = await request.json();

    if (!framework) {
      return NextResponse.json(
        { error: 'Missing framework in request body' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] 🚀 Generating Executive One-Pager on-demand`);

    const onePagerPrompt = createExecutiveOnePagerPrompt(framework);
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: onePagerPrompt }],
      temperature: 0.7
    });

    const executiveOnePager = result.choices[0]?.message?.content || '';

    // Track costs
    const cost = calculateCost('gpt-4o', {
      input: result.usage?.prompt_tokens || 0,
      output: result.usage?.completion_tokens || 0,
      total: result.usage?.total_tokens || 0
    });

    trackCost('generate-onepager-ondemand', cost, {
      requestId,
      userId,
      anonymousId,
      duration: Date.now() - startTime
    });

    console.log(`[${requestId}] ✅ Executive One-Pager generated in ${(Date.now() - startTime) / 1000}s`);
    console.log(`[${requestId}] 💰 Cost: $${cost.totalCost.toFixed(4)}`);

    return NextResponse.json({
      executiveOnePager,
      metadata: {
        generatedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
        cost: {
          total: cost.totalCost,
          tokens: {
            input: result.usage?.prompt_tokens || 0,
            output: result.usage?.completion_tokens || 0,
            total: result.usage?.total_tokens || 0
          }
        }
      }
    });

  } catch (error) {
    console.error(`[${requestId}] ❌ One-Pager generation error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate one-pager' },
      { status: 500 }
    );
  }
}

