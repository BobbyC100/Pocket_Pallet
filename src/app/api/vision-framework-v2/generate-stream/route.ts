import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import {
  VisionFrameworkV2,
  validateVisionFrameworkV2,
  createVisionFrameworkPrompt,
  createExecutiveOnePagerPrompt
} from '@/lib/vision-framework-schema-v2';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';
import { calculateCost, trackCost, AIModel } from '@/lib/cost-tracker';
import { createSSETransformer, createStreamResponse, sendStreamEvent, StreamEvent } from '@/lib/streaming-utils';
import { retrieveForGeneration, formatCitations, getCitation, type RetrievalResult } from '@/lib/rgrs/retrieval';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('X-Request-ID') || 'unknown';
  
  try {
    const { companyId, responses, userId, anonymousId } = await request.json();

    // Rate limiting
    if (process.env.DISABLE_RATE_LIMIT !== 'true') {
      const identifier = userId || anonymousId || request.ip || 'unknown';
      const rateLimit = checkRateLimit(identifier, RATE_LIMITS.AI_GENERATION);
      
      if (!rateLimit.allowed) {
        console.warn(`[${requestId}] ⚠️  Rate limit exceeded for ${identifier}`);
        // Return error as JSON for rate limit (not a stream)
        return Response.json(
          rateLimitResponse(rateLimit),
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rateLimit.retryAfter),
            }
          }
        );
      }
      
      console.log(`[${requestId}] ✓ Rate limit check passed (${rateLimit.remaining} remaining)`);
    }

    console.log(`[${requestId}] 🚀 Starting Vision Framework V2 streaming generation with GPT-4`);
    console.log(`[${requestId}] 📝 Company:`, companyId);

    // Create streaming response
    const transformer = createSSETransformer();
    const writer = transformer.writable.getWriter();

    // Start async generation process
    (async () => {
      try {
        // Step 0: Retrieve research-backed insights
        await sendStreamEvent(writer, {
          type: 'step_start',
          step: 'research',
          message: 'Retrieving research-backed insights...'
        });

        const step0Start = Date.now();
        let researchChunks: RetrievalResult[] = [];
        let researchContext = '';
        
        try {
          researchChunks = await retrieveForGeneration(responses);
          
          if (researchChunks.length > 0) {
            researchContext = '\n\n## Research-Backed Insights\n\n' +
              'The following findings from organizational science research inform your framework:\n\n' +
              researchChunks.map((r, idx) => {
                const citation = getCitation(r);
                return `**[${idx + 1}] ${citation.title}** (${citation.section || 'N/A'})\n${r.chunk.content.slice(0, 400)}...\n`;
              }).join('\n') +
              '\n---\n\n';
            
            console.log(`[${requestId}] 📚 Retrieved ${researchChunks.length} research chunks`);
          } else {
            console.log(`[${requestId}] ℹ️  No research chunks found (corpus may be empty)`);
          }
        } catch (error) {
          console.error(`[${requestId}] ⚠️  Research retrieval failed, continuing without:`, error);
          // Continue generation even if research retrieval fails
        }

        await sendStreamEvent(writer, {
          type: 'step_complete',
          step: 'research',
          message: researchChunks.length > 0 
            ? `Found ${researchChunks.length} relevant research insights`
            : 'No research insights found (continuing with standard generation)',
          duration: Date.now() - step0Start,
          data: {
            chunksRetrieved: researchChunks.length,
            citations: researchChunks.map(r => getCitation(r))
          }
        });

        // Step 1: Generate framework (with research context)
        await sendStreamEvent(writer, {
          type: 'step_start',
          step: 'framework',
          message: 'Analyzing your responses and mapping strategic framework...'
        });

        const step1Start = Date.now();
        const basePrompt = createVisionFrameworkPrompt(responses);
        const frameworkPrompt = researchContext 
          ? basePrompt + researchContext + 'When crafting the framework, incorporate insights from the research above where relevant. Reference specific findings to add credibility.'
          : basePrompt;
        const frameworkResult = await openai.chat.completions.create({
          model: "gpt-4o", // Upgraded from gpt-4-turbo-preview - 2x faster, same quality
          messages: [{ role: "user", content: frameworkPrompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        const frameworkText = frameworkResult.choices[0]?.message?.content || '{}';
        
        // Parse framework
        let frameworkData: Partial<VisionFrameworkV2>;
        const jsonMatch = frameworkText.match(/\`\`\`json\s*([\s\S]*?)\`\`\`/);
        if (jsonMatch) {
          frameworkData = JSON.parse(jsonMatch[1]);
        } else {
          frameworkData = JSON.parse(frameworkText);
        }

        const completeFramework: VisionFrameworkV2 = {
          companyId,
          updatedAt: new Date().toISOString(),
          vision: frameworkData.vision || '',
          strategy: frameworkData.strategy || [],
          operating_principles: frameworkData.operating_principles || [],
          near_term_bets: frameworkData.near_term_bets || [],
          metrics: frameworkData.metrics || [],
          tensions: frameworkData.tensions || []
        };

        await sendStreamEvent(writer, {
          type: 'step_complete',
          step: 'framework',
          message: 'Framework structure complete',
          duration: Date.now() - step1Start,
          data: completeFramework
        });

        // Step 2: Validate
        await sendStreamEvent(writer, {
          type: 'step_start',
          step: 'validation',
          message: 'Validating framework structure...'
        });

        const step2Start = Date.now();
        const validation = validateVisionFrameworkV2(completeFramework);
        
        if (!validation.success) {
          await sendStreamEvent(writer, {
            type: 'step_error',
            step: 'validation',
            message: 'Validation failed',
            data: { errors: validation.errors }
          });
          await sendStreamEvent(writer, {
            type: 'error',
            message: 'Generated framework failed validation',
            data: { errors: validation.errors }
          });
          await writer.close();
          return;
        }

        await sendStreamEvent(writer, {
          type: 'step_complete',
          step: 'validation',
          message: 'Framework validated successfully',
          duration: Date.now() - step2Start
        });

        // ⚡ OPTIMIZATION: Skip One-Pager, QA, and Scoring (now on-demand)
        // These steps are deferred to improve generation speed by ~50%
        // Generate on-demand when user clicks respective tabs

        // Calculate costs (framework generation only)
        const totalUsage = {
          input: (frameworkResult.usage?.prompt_tokens || 0),
          output: (frameworkResult.usage?.completion_tokens || 0),
          total: (frameworkResult.usage?.total_tokens || 0)
        };

        const cost = calculateCost('gpt-4o', totalUsage);
        trackCost('generate-vision-framework-v2-stream', cost, {
          requestId,
          userId,
          anonymousId,
          companyId,
          duration: Date.now() - startTime,
          sectionsGenerated: Object.keys(completeFramework).length,
          optimized: true // Flag to track optimized generation
        });

        console.log(`[${requestId}] 💰 Total Cost: $${cost.totalCost.toFixed(4)} (${cost.tokens.total} tokens)`);
        console.log(`[${requestId}] ⏱️  Total Duration: ${(Date.now() - startTime) / 1000}s`);
        console.log(`[${requestId}] 📚 Sending ${researchChunks.length} citations in final response`);
        console.log(`[${requestId}] ⚡ Optimization enabled: One-Pager, QA, and Scoring deferred to on-demand`);

        // Send final complete event
        await sendStreamEvent(writer, {
          type: 'complete',
          message: 'Vision Framework generated successfully',
          data: {
            framework: completeFramework,
            executiveOnePager: null, // Deferred to on-demand
            metadata: {
              modelsUsed: ['gpt-4o'],
              qaChecks: null, // Deferred to on-demand
              qualityScores: null, // Deferred to on-demand
              researchCitations: researchChunks.length > 0 
                ? researchChunks.map(r => getCitation(r))
                : [],
              researchBacked: researchChunks.length > 0,
              generatedAt: new Date().toISOString(),
              cost: {
                total: cost.totalCost,
                tokens: totalUsage
              },
              duration: Date.now() - startTime,
              optimized: true // Flag for client to know data is deferred
            }
          }
        });

      } catch (error) {
        console.error(`[${requestId}] ❌ Vision Framework V2 generation error:`, error);
        await sendStreamEvent(writer, {
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response
    return createStreamResponse(transformer.readable);

  } catch (error) {
    console.error('❌ Vision Framework V2 streaming setup error:', error);
    return Response.json(
      {
        error: 'Failed to start Vision Framework V2 generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * QA Checks for Vision Framework V2
 */
async function performQAChecks(openai: OpenAI, framework: VisionFrameworkV2) {
  const qaPrompt = `Review this Vision Framework and perform QA checks:

**Framework:**
${JSON.stringify(framework, null, 2)}

**Check for:**
1. **Consistency**: Do the bets align with the strategy? Do metrics match the bets?
2. **Measurability**: Does every bet have a concrete measure? Are metrics trackable?
3. **Tensions**: Are the tensions real contradictions, not generic statements?
4. **Actionability**: Are bets specific enough to act on? Do they have clear owners?
5. **Completeness**: Are there gaps? Missing critical areas?

**Return JSON:**
\`\`\`json
{
  "consistency": { "pass": true/false, "issues": ["..."] },
  "measurability": { "pass": true/false, "issues": ["..."] },
  "tensions": { "pass": true/false, "score": 1-10, "feedback": "..." },
  "actionability": { "pass": true/false, "issues": ["..."] },
  "completeness": { "pass": true/false, "gaps": ["..."] },
  "overallScore": 1-10,
  "recommendations": ["..."]
}
\`\`\``;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for QA - faster and cheaper for validation tasks
      messages: [{ role: "user", content: qaPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    const text = result.choices[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('QA check error:', error);
    return { error: 'QA checks failed', details: error instanceof Error ? error.message : 'Unknown' };
  }
}

/**
 * Quality scoring for each framework section
 */
async function scoreFrameworkQuality(openai: OpenAI, framework: VisionFrameworkV2, originalResponses: any) {
  const scoringPrompt = `Assess the quality of this Vision Framework. Rate each section on key criteria.

**Framework:**
${JSON.stringify(framework, null, 2)}

**Original Founder Responses:**
${JSON.stringify(originalResponses, null, 2)}

Rate each section on 1-10 scale:
- **Specificity**: Generic (1) vs Concrete (10)
- **Actionability**: Vague (1) vs Clear (10)
- **Alignment**: Off-brand (1) vs On-brand (10) **⭐ MOST CRITICAL - Weighted 2x**
- **Measurability**: For bets/metrics only (1-10)

**CRITICAL: Alignment is Weighted 2x in overallScore calculation**
Alignment is the most important factor. The content must match the founder's authentic voice and strategic intent.

**Calculate overallScore using weighted formula:**
- For sections with measurability (near_term_bets, metrics): \`overallScore = (Specificity + Actionability + Alignment × 2 + Measurability) / 5\`
- For other sections: \`overallScore = (Specificity + Actionability + Alignment × 2) / 4\`

Return JSON with scores, issues, suggestions, and strengths for each section.

\`\`\`json
{
  "vision": {"specificity": 8, "actionability": 7, "alignment": 9, "overallScore": 8.25, "issues": [], "suggestions": ["..."], "strengths": ["..."]},
  "strategy": {"specificity": 6, "actionability": 7, "alignment": 8, "overallScore": 7.25, "issues": ["..."], "suggestions": ["..."], "strengths": ["..."]},
  "operating_principles": {"specificity": 7, "actionability": 8, "alignment": 9, "overallScore": 8.25, "issues": [], "suggestions": ["..."], "strengths": ["..."]},
  "near_term_bets": {"specificity": 5, "actionability": 6, "alignment": 7, "measurability": 4, "overallScore": 5.8, "issues": ["..."], "suggestions": ["..."], "strengths": ["..."]},
  "metrics": {"specificity": 8, "actionability": 9, "alignment": 8, "measurability": 9, "overallScore": 8.4, "issues": [], "suggestions": ["..."], "strengths": ["..."]},
  "tensions": {"specificity": 7, "actionability": 6, "alignment": 8, "overallScore": 7.25, "issues": ["..."], "suggestions": ["..."], "strengths": ["..."]}
}
\`\`\`

Example: vision with (8, 7, 9) = (8 + 7 + 9×2) / 4 = 33/4 = 8.25`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for scoring - faster and cheaper for evaluation tasks
      messages: [{ role: "user", content: scoringPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    const text = result.choices[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Quality scoring error:', error);
    // Return neutral scores on error
    return {
      vision: { specificity: 7, actionability: 7, alignment: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      strategy: { specificity: 7, actionability: 7, alignment: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      operating_principles: { specificity: 7, actionability: 7, alignment: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      near_term_bets: { specificity: 7, actionability: 7, alignment: 7, measurability: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      metrics: { specificity: 7, actionability: 7, alignment: 7, measurability: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      tensions: { specificity: 7, actionability: 7, alignment: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] }
    };
  }
}

