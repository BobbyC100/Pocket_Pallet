import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // Pre-filled fictional startup data for quick testing
    const testResponses = {
      problem_now: "Small businesses waste 15+ hours per week on manual inventory management, leading to stockouts, overstock, and lost revenue. Current solutions are either too expensive for SMBs or too complex for non-technical users. With supply chain disruptions and rising costs, efficient inventory management has become critical for survival.",
      customer_gtm: "Primary: Small retail businesses (10-50 employees) with $500K-$5M revenue. Secondary: Restaurant chains and service businesses. GTM: Direct sales through LinkedIn outreach, content marketing, and partnerships with business consultants. Freemium model to reduce friction.",
      traction_proud: "Beta launched 3 months ago with 25 paying customers. $50K ARR already achieved. 40% month-over-month growth. Customer NPS of 72. Two enterprise pilots in progress with major retail chains. Team includes former Shopify and Square engineers.",
      milestone_6mo: "Scale to 200 paying customers and $400K ARR. Launch mobile app and API integrations. Complete Series A fundraising of $3M. Expand team to 15 people including VP of Sales and Customer Success lead.",
      cash_on_hand: 450000,
      monthly_burn: 65000,
      risky_assumption: "Key risk: Competition from established players like Shopify and Square entering our niche. Technical risk: Scaling our real-time inventory sync across multiple platforms. Market risk: Economic downturn could reduce SMB spending on software tools."
    };

    // Create prompts for both founder and VC briefs
    const founderPrompt = createFounderPrompt(testResponses);
    const vcPrompt = createVCPrompt(testResponses);

    // Generate both briefs in parallel
    const [founderResponse, vcResponse] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: founderPrompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: vcPrompt }],
        temperature: 0.7,
        max_tokens: 1500,
      })
    ]);

    const founderBriefMd = founderResponse.choices[0]?.message?.content || '';
    const vcSummaryMd = vcResponse.choices[0]?.message?.content || '';

    // Calculate runway
    const runwayMonths = Math.floor(testResponses.cash_on_hand / testResponses.monthly_burn);

    return NextResponse.json({
      founderBriefMd,
      vcSummaryMd,
      runwayMonths,
      testData: testResponses
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test brief' },
      { status: 500 }
    );
  }
}

function createFounderPrompt(responses: any): string {
  return `You are an expert startup advisor helping founders create comprehensive investor briefs. 

Create a detailed founder brief using the following information:

**Problem & Timing:**
${responses.problem_now}

**Target Market & Go-to-Market:**
${responses.customer_gtm}

**Progress & Traction:**
${responses.traction_proud}

**6-Month Goals:**
${responses.milestone_6mo}

**Financial Position:**
Cash on hand: $${responses.cash_on_hand}
Monthly burn: $${responses.monthly_burn}

**Risks & Assumptions:**
${responses.risky_assumption}

Please create a professional, comprehensive founder brief in markdown format. Structure it with clear headings and make the content compelling while staying truthful to the provided information. Include insights and recommendations where appropriate.`;
}

function createVCPrompt(responses: any): string {
  return `You are a VC analyst creating a concise investment summary. 

Create a VC-ready summary using this information:

**Problem & Timing:**
${responses.problem_now}

**Target Market & Go-to-Market:**
${responses.customer_gtm}

**Progress & Traction:**
${responses.traction_proud}

**6-Month Goals:**
${responses.milestone_6mo}

**Financial Position:**
Cash: $${responses.cash_on_hand} | Burn: $${responses.monthly_burn}/mo

**Risks & Assumptions:**
${responses.risky_assumption}

Create a concise, investment-focused summary in markdown format. Focus on key metrics, market opportunity, traction, and risks. Make it easy for VCs to quickly assess the opportunity.`;
}
