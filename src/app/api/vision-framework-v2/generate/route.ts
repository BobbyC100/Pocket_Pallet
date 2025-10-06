import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  VisionFrameworkV2,
  validateVisionFrameworkV2,
  createVisionFrameworkPrompt,
  createExecutiveOnePagerPrompt
} from '@/lib/vision-framework-schema-v2';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';
import { calculateCost, trackCost } from '@/lib/cost-tracker';

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
        return NextResponse.json(
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

    console.log(`[${requestId}] 🚀 Starting Vision Framework V2 generation with GPT-4`);
    console.log(`[${requestId}] 📝 Company:`, companyId);

    // Step 1: GPT-4 generates the framework with contradiction detection
    console.log('Step 1: GPT-4 mapping sections and detecting tensions...');
    const frameworkPrompt = createVisionFrameworkPrompt(responses);
    const frameworkResult = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: frameworkPrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    const frameworkText = frameworkResult.choices[0]?.message?.content || '{}';
    
    console.log('✅ Framework structure generated');
    console.log('Raw Gemini response (first 500 chars):', frameworkText.substring(0, 500));

    // Extract JSON from response (handle markdown code blocks)
    let frameworkData: Partial<VisionFrameworkV2>;
    try {
      const jsonMatch = frameworkText.match(/\`\`\`json\s*([\s\S]*?)\`\`\`/);
      if (jsonMatch) {
        console.log('Found JSON in code block');
        frameworkData = JSON.parse(jsonMatch[1]);
      } else {
        console.log('No code block found, parsing entire response');
        // Try parsing the whole response
        frameworkData = JSON.parse(frameworkText);
      }
      console.log('Parsed framework data:', JSON.stringify(frameworkData, null, 2).substring(0, 500));
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError);
      console.error('Raw response:', frameworkText);
      throw new Error('Failed to parse Vision Framework from Gemini response');
    }

    // Add metadata and ensure all required fields exist
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
    
    console.log('📊 Complete framework structure:');
    console.log('  - vision:', completeFramework.vision?.substring(0, 50) + '...');
    console.log('  - strategy length:', completeFramework.strategy?.length);
    console.log('  - operating_principles length:', completeFramework.operating_principles?.length);
    console.log('  - near_term_bets length:', completeFramework.near_term_bets?.length);
    console.log('  - metrics length:', completeFramework.metrics?.length);
    console.log('  - tensions length:', completeFramework.tensions?.length);

    console.log('Complete framework structure:', {
      hasVision: !!completeFramework.vision,
      strategyCount: completeFramework.strategy.length,
      principlesCount: completeFramework.operating_principles.length,
      betsCount: completeFramework.near_term_bets.length,
      metricsCount: completeFramework.metrics.length,
      tensionsCount: completeFramework.tensions.length
    });

    // Log sample bet to check structure
    if (completeFramework.near_term_bets.length > 0) {
      console.log('Sample bet structure:', JSON.stringify(completeFramework.near_term_bets[0], null, 2));
    }
    if (completeFramework.metrics.length > 0) {
      console.log('Sample metric structure:', JSON.stringify(completeFramework.metrics[0], null, 2));
    }

    // Validate
    console.log('Step 2: Validating framework...');
    const validation = validateVisionFrameworkV2(completeFramework);
    console.log('Validation result:', validation);
    
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Generated framework failed validation',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    console.log('✅ Framework validated');

    // Step 3: Create executive one-pager with GPT-4
    console.log('Step 3: Creating executive one-pager...');
    const onePagerPrompt = createExecutiveOnePagerPrompt(completeFramework);
    const onePagerResult = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: onePagerPrompt }],
      temperature: 0.7
    });
    const executiveOnePager = onePagerResult.choices[0]?.message?.content || '';
    
    console.log('✅ Executive one-pager generated');

    // Step 4: QA checks with GPT-4
    console.log('Step 4: Running QA checks...');
    const qaResults = await performQAChecks(openai, completeFramework);
    console.log('✅ QA checks complete');

    // Step 5: Quality scoring for each section
    console.log(`[${requestId}] Step 5: Scoring section quality...`);
    const qualityScores = await scoreFrameworkQuality(openai, completeFramework, responses);
    console.log(`[${requestId}] ✅ Quality scoring complete`);

    // Calculate total cost from all API calls
    const totalUsage = {
      input: (frameworkResult.usage?.prompt_tokens || 0) + 
             (onePagerResult.usage?.prompt_tokens || 0),
      output: (frameworkResult.usage?.completion_tokens || 0) + 
              (onePagerResult.usage?.completion_tokens || 0),
      total: (frameworkResult.usage?.total_tokens || 0) + 
             (onePagerResult.usage?.total_tokens || 0)
    };

    // Track costs
    const cost = calculateCost('gpt-4-turbo-preview', totalUsage);
    trackCost('generate-vision-framework-v2', cost, {
      requestId,
      userId,
      anonymousId,
      companyId,
      duration: Date.now() - startTime,
      sectionsGenerated: Object.keys(completeFramework).length
    });
    console.log(`[${requestId}] 💰 Total Cost: $${cost.totalCost.toFixed(4)} (${cost.tokens.total} tokens)`);
    console.log(`[${requestId}] ⏱️  Total Duration: ${(Date.now() - startTime) / 1000}s`);

    return NextResponse.json({
      status: 'success',
      framework: completeFramework,
      executiveOnePager,
      metadata: {
        modelsUsed: ['gpt-4-turbo-preview'],
        qaChecks: qaResults,
        qualityScores: qualityScores,
        generatedAt: new Date().toISOString(),
        cost: {
          total: cost.totalCost,
          tokens: totalUsage
        },
        duration: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('❌ Vision Framework V2 generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Vision Framework V2',
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
      model: "gpt-4-turbo-preview",
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
      model: "gpt-4-turbo-preview",
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

