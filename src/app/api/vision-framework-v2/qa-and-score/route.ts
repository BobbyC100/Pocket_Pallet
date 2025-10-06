import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateCost, trackCost } from '@/lib/cost-tracker';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/vision-framework-v2/qa-and-score
 * Generate QA Checks + Quality Scoring in one call (optimized)
 * 
 * Combines two separate calls into one to reduce latency
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('X-Request-ID') || crypto.randomUUID();

  try {
    const { framework, originalResponses, userId, anonymousId } = await request.json();

    if (!framework) {
      return NextResponse.json(
        { error: 'Missing framework in request body' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] 🚀 Running QA checks and quality scoring on-demand`);

    // Combined QA + Scoring prompt
    const combinedPrompt = `You are evaluating a Vision Framework. Perform BOTH quality assurance checks AND detailed quality scoring.

**Framework:**
${JSON.stringify(framework, null, 2)}

**Original Founder Responses:**
${JSON.stringify(originalResponses || {}, null, 2)}

---

## Part 1: QA Checks

Check for:
1. **Consistency**: Do the bets align with the strategy? Do metrics match the bets?
2. **Measurability**: Does every bet have a concrete measure? Are metrics trackable?
3. **Tensions**: Are the tensions real contradictions, not generic statements?
4. **Actionability**: Are bets specific enough to act on? Do they have clear owners?
5. **Completeness**: Are there gaps? Missing critical areas?

## Part 2: Quality Scoring

Rate each section (Vision, Strategy, Operating Principles, Near-term Bets, Metrics, Tensions) on:
- **Specificity**: Generic (1) vs Concrete (10)
- **Actionability**: Vague (1) vs Clear (10)
- **Alignment**: Off-brand (1) vs On-brand (10) **⭐ WEIGHTED 2x**
- **Measurability**: For bets/metrics only (1-10)

**Calculate overallScore using weighted formula:**
- For sections with measurability (near_term_bets, metrics): \`overallScore = (Specificity + Actionability + Alignment × 2 + Measurability) / 5\`
- For other sections: \`overallScore = (Specificity + Actionability + Alignment × 2) / 4\`

---

**Return JSON:**
\`\`\`json
{
  "qaResults": {
    "consistency": { "pass": true/false, "issues": ["..."] },
    "measurability": { "pass": true/false, "issues": ["..."] },
    "tensions": { "pass": true/false, "score": 1-10, "feedback": "..." },
    "actionability": { "pass": true/false, "issues": ["..."] },
    "completeness": { "pass": true/false, "gaps": ["..."] },
    "overallScore": 1-10,
    "recommendations": ["..."]
  },
  "qualityScores": {
    "vision": {
      "specificity": 8,
      "actionability": 7,
      "alignment": 9,
      "overallScore": 8.25,
      "issues": [],
      "suggestions": ["..."],
      "strengths": ["..."]
    },
    "strategy": {
      "specificity": 6,
      "actionability": 7,
      "alignment": 8,
      "overallScore": 7.25,
      "issues": ["..."],
      "suggestions": ["..."],
      "strengths": ["..."]
    },
    "operating_principles": {
      "specificity": 7,
      "actionability": 8,
      "alignment": 9,
      "overallScore": 8.25,
      "issues": [],
      "suggestions": ["..."],
      "strengths": ["..."]
    },
    "near_term_bets": {
      "specificity": 5,
      "actionability": 6,
      "alignment": 7,
      "measurability": 4,
      "overallScore": 5.8,
      "issues": ["..."],
      "suggestions": ["..."],
      "strengths": ["..."]
    },
    "metrics": {
      "specificity": 8,
      "actionability": 9,
      "alignment": 8,
      "measurability": 9,
      "overallScore": 8.4,
      "issues": [],
      "suggestions": ["..."],
      "strengths": ["..."]
    },
    "tensions": {
      "specificity": 7,
      "actionability": 6,
      "alignment": 8,
      "overallScore": 7.25,
      "issues": [],
      "suggestions": ["..."],
      "strengths": ["..."]
    }
  }
}
\`\`\``;

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for QA/Scoring - faster and cheaper
      messages: [{ role: "user", content: combinedPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const responseText = result.choices[0]?.message?.content || '{}';
    let data;
    
    try {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[1]);
      } else {
        data = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error(`[${requestId}] ❌ Failed to parse QA/Score JSON:`, parseError);
      throw new Error('Failed to parse AI response');
    }

    // Track costs
    const cost = calculateCost('gpt-4o-mini', {
      input: result.usage?.prompt_tokens || 0,
      output: result.usage?.completion_tokens || 0,
      total: result.usage?.total_tokens || 0
    });

    trackCost('qa-and-score-ondemand', cost, {
      requestId,
      userId,
      anonymousId,
      duration: Date.now() - startTime
    });

    console.log(`[${requestId}] ✅ QA and Scoring completed in ${(Date.now() - startTime) / 1000}s`);
    console.log(`[${requestId}] 💰 Cost: $${cost.totalCost.toFixed(4)}`);

    return NextResponse.json({
      qaResults: data.qaResults || {},
      qualityScores: data.qualityScores || {},
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
    console.error(`[${requestId}] ❌ QA/Score generation error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate QA and scoring' },
      { status: 500 }
    );
  }
}

