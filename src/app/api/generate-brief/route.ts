import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
// import Anthropic from '@anthropic-ai/sdk'; // Commented out - not available in France

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// }); // Commented out - not available in France

export async function POST(request: NextRequest) {
  try {
    const { responses } = await request.json();

    // Create prompts for both founder and VC briefs
    const founderPrompt = createFounderPrompt(responses);
    const vcPrompt = createVCPrompt(responses);

    // Try to generate with both models, but handle failures gracefully
    let gpt4FounderContent = '';
    let gpt4VCContent = '';
    let claudeFounderContent = '';
    let claudeVCContent = '';
    let modelsUsed = ['gpt-4'];

    try {
      // Generate with GPT-4
      const [gpt4Founder, gpt4VC] = await Promise.all([
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

      gpt4FounderContent = gpt4Founder.choices[0]?.message?.content || '';
      gpt4VCContent = gpt4VC.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('GPT-4 error:', error);
      throw new Error('GPT-4 generation failed');
    }

    try {
      // Try to generate with Claude (commented out - not available in France)
      // const [claudeFounder, claudeVC] = await Promise.all([
      //   anthropic.messages.create({
      //     model: "claude-3-sonnet-20240229",
      //     max_tokens: 2000,
      //     messages: [{ role: "user", content: founderPrompt }],
      //   }),
      //   anthropic.messages.create({
      //     model: "claude-3-sonnet-20240229", 
      //     max_tokens: 1500,
      //     messages: [{ role: "user", content: vcPrompt }],
      //   })
      // ]);

      // claudeFounderContent = claudeFounder.content[0].type === 'text' ? claudeFounder.content[0].text : '';
      // claudeVCContent = claudeVC.content[0].type === 'text' ? claudeVC.content[0].text : '';
      // modelsUsed.push('claude');
    } catch (error) {
      console.error('Claude error:', error);
      // Continue with GPT-4 only
    }

    // Create consensus briefs
    const founderBriefMd = createConsensusBrief(gpt4FounderContent, claudeFounderContent, 'founder');
    const vcSummaryMd = createConsensusBrief(gpt4VCContent, claudeVCContent, 'vc');

    // Calculate runway
    const runwayMonths = responses.cash_on_hand && responses.monthly_burn 
      ? Math.floor(responses.cash_on_hand / responses.monthly_burn)
      : null;

    return NextResponse.json({
      founderBriefMd,
      vcSummaryMd,
      runwayMonths,
      models: modelsUsed,
      consensus: modelsUsed.length > 1
    });

  } catch (error) {
    console.error('AI API error:', error);
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

Create a professional, narrative-driven brief in markdown format. Structure it with clear headings. Synthesize the founder's responses into a compelling story that shows: (1) deep market insight, (2) strategic clarity despite uncertainty, (3) cultural intentionality, and (4) operational realism. Make it investor-ready while preserving the founder's voice.`;
}

function createVCPrompt(responses: any): string {
  return `You are a VC analyst creating a concise investment summary.

Create a VC-ready summary from these founder responses. Do NOT include a title - start directly with sections.

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

Create a concise, investment-focused summary in markdown format. Distill into: (1) Market Opportunity & Timing, (2) Team & Traction, (3) Business Model Clarity, (4) Capital Efficiency, (5) Key Risks. Be direct and analytical. Make it easy for VCs to quickly assess fit.`;
}

function createConsensusBrief(gpt4Content: string, claudeContent: string, type: 'founder' | 'vc'): string {
  // For now, we'll use GPT-4 as the primary and add Claude insights as additional sections
  // In a more sophisticated implementation, we could use another AI call to synthesize both
  
  // Remove any existing titles from the content
  const cleanContent = gpt4Content.replace(/^#\s+.*?\n\n/gm, '').replace(/^\*.*?\*\n\n/gm, '');
  
  return cleanContent;
}
