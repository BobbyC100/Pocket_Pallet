import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError instanceof Error ? parseError.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const { responses } = body;
    
    if (!responses) {
      console.error('❌ No responses in request body');
      return NextResponse.json(
        { error: 'Missing responses in request body' },
        { status: 400 }
      );
    }

    console.log('🚀 Brief generation started');

    // FAST MODE: GPT-4 only, no tightening, no QA
    // Total time: ~15-20 seconds instead of 30-35 seconds
    
    const gpt4Briefs = await generateGPT4Briefs(responses);
    const founderBriefMd = gpt4Briefs.founder;
    const vcSummaryMd = gpt4Briefs.vc;
    
    console.log('✅ Briefs generated');

    // Calculate runway if available
    const runwayMonths = calculateRunway(responses);

    return NextResponse.json({
      founderBriefMd,
      vcSummaryMd,
      runwayMonths,
      responses // Pass through for framework generation
    });

  } catch (error) {
    console.error('❌ Brief generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to generate brief',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Step 1: Gemini Pro creates structured outline
 */
function createOutlinePrompt(responses: any): string {
  return `You are an expert startup advisor. Given these 8 inputs from a founder, produce a detailed two-level outline for their investor brief.

**Strategic Inputs:**
1. **Vision, Audience & Timing:** ${responses.vision_audience_timing}
2. **Hard Decisions:** ${responses.hard_decisions}
3. **Success Definition:** ${responses.success_definition}
4. **Core Principles:** ${responses.core_principles}
5. **Required Capabilities:** ${responses.required_capabilities}
6. **Current State:** ${responses.current_state}
7. **Vision Purpose:** ${responses.vision_purpose}
8. **Vision End State:** ${responses.vision_endstate}

Create a structured outline with:
- Executive Summary (1-sentence "why now")
- Problem & Opportunity
- Solution & Approach
- Market & Customer
- Traction & Milestones
- Team & Execution
- Financial Position
- Strategic Priorities

For each section, include 2-3 bullet points. Flag any missing numbers with [[NEEDS_DATA: description]].

The outline should serve as the foundation for both a founder-facing brief (narrative, strategic) and a VC-facing brief (metrics, opportunity).`;
}

/**
 * Step 2a: GPT-4 generates its versions
 */
async function generateGPT4Briefs(responses: any) {
  const founderPrompt = createFounderPrompt(responses);
  const vcPrompt = createVCPrompt(responses);

  const [founderResult, vcResult] = await Promise.all([
    openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: founderPrompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
    openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: vcPrompt }],
      temperature: 0.7,
      max_tokens: 1500,
    })
  ]);

  return {
    founder: founderResult.choices[0]?.message?.content || '',
    vc: vcResult.choices[0]?.message?.content || ''
  };
}

/**
 * Step 2b: Gemini Pro generates its versions
 */
async function generateGeminiProBriefs(responses: any, outline: string) {
  const geminiPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const founderPrompt = `Using this outline:\n\n${outline}\n\nCreate a 500-800 word founder-facing brief that tells a compelling narrative. Include the one-sentence "why now" prominently. Use the founder's voice and preserve strategic nuance. Start directly with content (no title).

Context: ${JSON.stringify(responses, null, 2)}`;

  const vcPrompt = `Using this outline:\n\n${outline}\n\nCreate a concise VC-facing summary (400-600 words) focused on: market opportunity, traction metrics, team credibility, capital efficiency, and key risks. Be analytical and direct. Start directly with content (no title).

Context: ${JSON.stringify(responses, null, 2)}`;

  const [founderResult, vcResult] = await Promise.all([
    geminiPro.generateContent(founderPrompt),
    geminiPro.generateContent(vcPrompt)
  ]);

  return {
    founder: founderResult.response.text(),
    vc: vcResult.response.text()
  };
}

/**
 * Step 3: Gemini Flash tightens and polishes
 */
async function tightenWithFlash(geminiFlash: any, gpt4Content: string, geminiContent: string, type: 'founder' | 'vc'): Promise<string> {
  const targetGrade = type === 'founder' ? '10th grade' : '12th grade';
  
  const prompt = `You are an editor. Here are two versions of the same ${type} brief:

**Version A (GPT-4):**
${gpt4Content}

**Version B (Gemini Pro):**
${geminiContent}

Your task:
1. Synthesize the best insights from both versions
2. Remove all hedging language ("might", "could", "perhaps")
3. Make every sentence earn its place
4. Target reading level: ${targetGrade}
5. Maintain ${type === 'founder' ? 'narrative flow and strategic depth' : 'analytical clarity and investor focus'}
6. Keep length: ${type === 'founder' ? '500-800 words' : '400-600 words'}

Output the final polished brief in markdown format. Start directly with content (no title).`;

  const result = await geminiFlash.generateContent(prompt);
  return result.response.text();
}

/**
 * Step 4: QA checks
 */
async function performQAChecks(geminiFlash: any, brief: string, responses: any) {
  const qaPrompt = `Review this founder brief and perform QA checks:

**Brief:**
${brief}

**Original Responses:**
${JSON.stringify(responses, null, 2)}

Check for:
1. **Claims vs Numbers**: Are quantitative claims backed by data from responses?
2. **Timelines**: Are timeframes clear and consistent?
3. **"Why Now" Clarity**: Is the market timing argument compelling?
4. **Single-Sentence Summary**: Can you distill this to one powerful sentence?

Return a JSON object:
{
  "claimsVsNumbers": { "pass": true/false, "issues": ["..."] },
  "timelines": { "pass": true/false, "issues": ["..."] },
  "whyNowClarity": { "pass": true/false, "score": 1-10, "feedback": "..." },
  "oneSentenceSummary": "..."
}`;

  try {
    const result = await geminiFlash.generateContent(qaPrompt);
    const text = result.response.text();
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { error: 'Could not parse QA results' };
  } catch (error) {
    console.error('QA check error:', error);
    return { error: 'QA checks failed' };
  }
}

/**
 * Prompt builders
 */
function createFounderPrompt(responses: any): string {
  return `You are an expert startup advisor helping founders create comprehensive investor briefs.

Create a detailed, strategic brief using the founder's responses below. Do NOT include a title - start directly with content sections.

**Vision, Audience & Timing:**
${responses.vision_audience_timing || 'Not specified'}

**Strategic Tensions & Hard Decisions:**
${responses.hard_decisions || 'Not specified'}

**Success Definition (Financial & Cultural):**
${responses.success_definition || 'Not specified'}

**Core Principles & Non-Negotiables:**
${responses.core_principles || 'Not specified'}

**Required Capabilities & Systems:**
${responses.required_capabilities || 'Not specified'}

**Current State (Team, Traction, Runway):**
${responses.current_state || 'Not specified'}

**Vision Purpose:**
${responses.vision_purpose || 'Not specified'}

**Vision End State:**
${responses.vision_endstate || 'Not specified'}

Create a professional, narrative-driven brief in markdown format. Structure it with clear headings. Synthesize the founder's responses into a compelling story that shows: (1) deep market insight, (2) strategic clarity despite uncertainty, (3) cultural intentionality, and (4) operational realism. Make it investor-ready while preserving the founder's voice.`;
}

function createVCPrompt(responses: any): string {
  return `You are a VC analyst creating a concise investment summary.

Create a VC-ready summary from these founder responses. Do NOT include a company name title - start directly with sections.

**Opportunity (What, Who, Why Now):**
${responses.vision_audience_timing || 'Not specified'}

**Strategic Position & Open Questions:**
${responses.hard_decisions || 'Not specified'}

**Ambition & Culture:**
${responses.success_definition || 'Not specified'}

**Values & Decision Filters:**
${responses.core_principles || 'Not specified'}

**Execution Requirements:**
${responses.required_capabilities || 'Not specified'}

**Current State:**
${responses.current_state || 'Not specified'}

**CRITICAL: Use this exact structure with these section headings:**

**Thesis**
[2-3 sentences: What problem, how you solve it, why this creates value]

**Market Opportunity**
[Market size, TAM/SAM, underserved segment, why this market matters now]

**Product**
[What you've built, how it works, key features that create value]

**Traction**
[Bullets with numbers: users, revenue, growth metrics, validation signals]

**Business Model**
[Pricing, unit economics, expansion strategy, path to scale]

**Team**
[Founder backgrounds, relevant experience, why this team can execute]

**Competition & Moat**
[Competitive landscape, why existing solutions fail, your defensibility]

**Financials**
[Current: cash, burn, runway. Raising: amount, use of funds. Milestones: what this capital unlocks]

**Why Now**
[Market forces, technology enablers, regulatory changes - why this moment]

**The Ask**
[Funding amount, use of proceeds, 12-18 month milestones]

Be direct, analytical, and metrics-focused. Use bullet points for traction and financials. Keep each section tight (2-4 sentences max, except traction which should be bullets).`;
}

/**
 * Calculate runway from current state
 */
function calculateRunway(responses: any): number | null {
  if (!responses.current_state) return null;
  
  const cashMatch = responses.current_state.match(/\$?([\d,]+)K?\s*cash/i);
  const burnMatch = responses.current_state.match(/\$?([\d,]+)K?\s*(monthly\s*)?burn/i);
  
  if (cashMatch && burnMatch) {
    const cash = parseInt(cashMatch[1].replace(/,/g, '')) * (cashMatch[0].includes('K') ? 1000 : 1);
    const burn = parseInt(burnMatch[1].replace(/,/g, '')) * (burnMatch[0].includes('K') ? 1000 : 1);
    
    if (burn > 0) {
      return Math.floor(cash / burn);
    }
  }
  
  // Look for explicit runway mention
  const runwayMatch = responses.current_state.match(/([\d]+)\s*months?\s*runway/i);
  if (runwayMatch) {
    return parseInt(runwayMatch[1]);
  }
  
  return null;
}
