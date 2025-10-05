import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { VisionFrameworkV2 } from '@/lib/vision-framework-schema-v2';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { framework, originalResponses } = await request.json();

    console.log('🔍 Starting quality assessment for Vision Framework');

    const scores = await scoreAllSections(framework, originalResponses);

    console.log('✅ Quality assessment complete');

    return NextResponse.json({
      status: 'success',
      scores,
      overallQuality: calculateOverallQuality(scores),
      weakSections: identifyWeakSections(scores)
    });

  } catch (error) {
    console.error('❌ Quality scoring error:', error);
    return NextResponse.json(
      {
        error: 'Failed to score framework',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function scoreAllSections(framework: VisionFrameworkV2, originalResponses: any) {
  const scoringPrompt = `You are a strategic advisor assessing the quality of a Vision Framework. Rate each section on key criteria and provide specific improvement suggestions.

**Framework to Assess:**
${JSON.stringify(framework, null, 2)}

**Original Founder Responses (for context):**
${JSON.stringify(originalResponses, null, 2)}

---

**Assessment Criteria:**

For each section, rate on a scale of 1-10 and provide suggestions:

1. **Specificity** - Generic (1) vs Concrete/Detailed (10)
2. **Actionability** - Vague (1) vs Clear next steps (10)  
3. **Alignment** - Off-brand (1) vs On-brand with founder's intent (10)
4. **Measurability** - Unmeasurable (1) vs Clear metrics (10) [for bets/metrics only]

**Common Quality Issues to Flag:**

❌ **Generic Phrases:**
- "Revolutionize", "transform", "innovate" without specifics
- "Build great products", "focus on customers" (too vague)
- "Increase revenue" without targets or method

✅ **Good Specificity:**
- Named markets, customer segments, geographies
- Concrete numbers, timelines, measures
- Clear actions with owners

---

**Return JSON:**

\`\`\`json
{
  "vision": {
    "specificity": 8,
    "actionability": 7,
    "alignment": 9,
    "overallScore": 8,
    "issues": ["Optional: specific problems found"],
    "suggestions": ["Be more specific about...", "Add details on..."],
    "strengths": ["Good use of concrete language"]
  },
  "strategy": {
    "specificity": 6,
    "actionability": 7,
    "alignment": 8,
    "overallScore": 7,
    "issues": ["Pillar 1 is too generic: 'Build great products'"],
    "suggestions": ["Replace generic pillars with specific competitive advantages"],
    "strengths": ["Clear focus on specific markets"]
  },
  "operating_principles": {
    "specificity": 7,
    "actionability": 8,
    "alignment": 9,
    "overallScore": 8,
    "issues": [],
    "suggestions": ["Consider adding decision filters"],
    "strengths": ["Principles are specific to company context"]
  },
  "near_term_bets": {
    "specificity": 5,
    "actionability": 6,
    "alignment": 7,
    "measurability": 4,
    "overallScore": 5.5,
    "issues": [
      "Bet 1 lacks a clear measure",
      "Bet 2 doesn't specify owner role"
    ],
    "suggestions": [
      "Add concrete success metrics to each bet",
      "Ensure every bet has a named owner (CEO, CTO, etc.)"
    ],
    "strengths": ["Clear timeframes"]
  },
  "metrics": {
    "specificity": 8,
    "actionability": 9,
    "alignment": 8,
    "measurability": 9,
    "overallScore": 8.5,
    "issues": [],
    "suggestions": ["Consider adding leading indicators"],
    "strengths": ["All metrics have clear targets and cadence"]
  },
  "tensions": {
    "specificity": 7,
    "actionability": 6,
    "alignment": 8,
    "overallScore": 7,
    "issues": ["Tension 3 feels theoretical, not based on actual strategy"],
    "suggestions": ["Make tensions more specific to founder's stated trade-offs"],
    "strengths": ["Identified real contradictions in strategy"]
  }
}
\`\`\`

**Be harsh but fair:** A score of 7-8 should be "good", 9-10 is "excellent". Most sections will be 5-7 on first generation.
`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: scoringPrompt }],
      temperature: 0.3, // Lower temp for consistent scoring
      response_format: { type: "json_object" }
    });

    const text = result.choices[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Scoring error:', error);
    // Return default neutral scores if scoring fails
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

function calculateOverallQuality(scores: any): number {
  const sectionScores = Object.values(scores).map((s: any) => s.overallScore || 7);
  const average = sectionScores.reduce((a: number, b: number) => a + b, 0) / sectionScores.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal
}

function identifyWeakSections(scores: any): string[] {
  const weakThreshold = 6; // Sections scoring below this need attention
  const weak: string[] = [];

  Object.entries(scores).forEach(([section, data]: [string, any]) => {
    if (data.overallScore < weakThreshold) {
      weak.push(section);
    }
  });

  return weak;
}

