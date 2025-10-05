import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { VcSummary } from '@/lib/vc-summary-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { vcSummary } = await request.json();

    console.log('🔍 Starting quality assessment for VC Summary');

    const scores = await scoreVCSummary(vcSummary);

    console.log('✅ VC Summary assessment complete');

    return NextResponse.json({
      status: 'success',
      scores,
      overallQuality: calculateOverallQuality(scores),
      weakSections: identifyWeakSections(scores)
    });

  } catch (error) {
    console.error('❌ VC Summary scoring error:', error);
    return NextResponse.json(
      {
        error: 'Failed to score VC Summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function scoreVCSummary(vcSummary: VcSummary) {
  const scoringPrompt = `You are a seasoned VC partner assessing an investment summary. Rate each section on key criteria that determine if this gets a meeting.

**VC Summary to Assess:**
${JSON.stringify(vcSummary, null, 2)}

---

**Assessment Criteria:**

For each section, rate on a scale of 1-10:

1. **Clarity** - Confusing (1) vs Crystal clear (10)
2. **Compelling** - Uninteresting (1) vs Must-meet-this-founder (10)
3. **Credibility** - Questionable claims (1) vs Believable with proof (10)
4. **Conciseness** - Verbose/vague (1) vs Tight and specific (10)

**Sections to Score:**

### 1. What/Why Now (Pitch)
- Is the problem clear and painful?
- Is the timing/market moment compelling?
- Does it make me want to know more?

### 2. Market Opportunity
- Is TAM/SAM clearly sized?
- Is the underserved segment specific?
- Does the math check out for a venture-scale outcome?

### 3. Solution Differentiation
- Are differentiators specific (not generic)?
- Do they create defensibility?
- Are they believable?

### 4. Traction & Proof Points
- Are metrics concrete with timeframes?
- Do they show momentum?
- Are they impressive for the stage?

### 5. Business Model & GTM
- Is the pricing/unit economics clear?
- Is the GTM strategy realistic?
- Can I see the path to $10M+ ARR?

### 6. Team Credibility
- Do founders have relevant domain expertise?
- Are credibility hooks specific?
- Would I trust them with $5M?

### 7. Ask & Use of Funds
- Is the ask amount reasonable for stage?
- Is use of funds specific and strategic?
- Does runway/milestones math make sense?

### 8. Risk Awareness
- Are risks real (not generic)?
- Are mitigations thoughtful (not hand-wavy)?
- Does founder understand the hard parts?

---

**Common Red Flags:**

❌ Generic language: "revolutionize", "disrupt", "transform"
❌ Vague market sizing: "billions" without source
❌ Traction without timeframes: "growing fast" (how fast?)
❌ Team without credibility hooks: "experienced team"
❌ Risks that feel like strengths in disguise
❌ "TBD" or "X" placeholders in key metrics

**Green Flags:**

✅ Specific numbers with dates
✅ Named customers, competitors, benchmarks
✅ Founder has "been there" credibility
✅ Traction metrics trend upward
✅ Clear why now moment

---

**Return JSON:**

\`\`\`json
{
  "whatWhyNow": {
    "clarity": 8,
    "compelling": 9,
    "credibility": 8,
    "conciseness": 7,
    "overallScore": 8,
    "issues": ["Optional: specific problems"],
    "suggestions": ["Be more specific about...", "Add data on..."],
    "strengths": ["Great hook", "Clear timing"]
  },
  "market": {
    "clarity": 7,
    "compelling": 6,
    "credibility": 7,
    "conciseness": 8,
    "overallScore": 7,
    "issues": ["TAM not sourced"],
    "suggestions": ["Add source for market size", "Name the segment more specifically"],
    "strengths": ["Clear focus"]
  },
  "solutionDiff": {
    "clarity": 8,
    "compelling": 7,
    "credibility": 8,
    "conciseness": 9,
    "overallScore": 8,
    "issues": [],
    "suggestions": ["Consider adding why competitors can't copy"],
    "strengths": ["Specific technical advantages"]
  },
  "traction": {
    "clarity": 9,
    "compelling": 8,
    "credibility": 9,
    "conciseness": 8,
    "overallScore": 8.5,
    "issues": [],
    "suggestions": ["Add growth rate if trending up"],
    "strengths": ["Concrete metrics with dates", "Shows momentum"]
  },
  "businessModel": {
    "clarity": 7,
    "compelling": 7,
    "credibility": 7,
    "conciseness": 8,
    "overallScore": 7,
    "issues": ["Unit economics unclear"],
    "suggestions": ["Add CAC and LTV if known", "Show path to gross margin"],
    "strengths": ["Clear pricing model"]
  },
  "team": {
    "clarity": 8,
    "compelling": 9,
    "credibility": 9,
    "conciseness": 8,
    "overallScore": 8.5,
    "issues": [],
    "suggestions": [],
    "strengths": ["Strong domain expertise", "Named companies create credibility"]
  },
  "ask": {
    "clarity": 8,
    "compelling": 7,
    "credibility": 8,
    "conciseness": 9,
    "overallScore": 8,
    "issues": [],
    "suggestions": ["Add what milestone the runway gets you to"],
    "strengths": ["Specific allocation", "Reasonable for stage"]
  },
  "risks": {
    "clarity": 7,
    "compelling": 6,
    "credibility": 7,
    "conciseness": 8,
    "overallScore": 7,
    "issues": ["Risk 2 mitigation feels weak"],
    "suggestions": ["Make mitigations more concrete", "Add what you've already done to address"],
    "strengths": ["Identified real risks, not generic ones"]
  }
}
\`\`\`

**Be honest:** A score of 8-9 means "this gets a meeting". 6-7 means "needs work but interesting". Below 6 means "pass". Most first drafts score 5-7.
`;

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
    console.error('Scoring error:', error);
    // Return default neutral scores if scoring fails
    return {
      whatWhyNow: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      market: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      solutionDiff: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      traction: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      businessModel: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      team: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      ask: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] },
      risks: { clarity: 7, compelling: 7, credibility: 7, conciseness: 7, overallScore: 7, issues: [], suggestions: [], strengths: [] }
    };
  }
}

function calculateOverallQuality(scores: any): number {
  const sectionScores = Object.values(scores).map((s: any) => s.overallScore || 7);
  const average = sectionScores.reduce((a: number, b: number) => a + b, 0) / sectionScores.length;
  return Math.round(average * 10) / 10;
}

function identifyWeakSections(scores: any): string[] {
  const weakThreshold = 6.5; // Slightly higher bar for VC summary
  const weak: string[] = [];

  Object.entries(scores).forEach(([section, data]: [string, any]) => {
    if (data.overallScore < weakThreshold) {
      weak.push(section);
    }
  });

  return weak;
}

