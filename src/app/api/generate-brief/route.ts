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

Create a detailed brief using the following information. Do NOT include a title or heading - start directly with the content sections:

**Problem & Timing:**
${responses.problem_now || 'Not specified'}

**Target Market & Go-to-Market:**
${responses.customer_gtm || 'Not specified'}

**Progress & Traction:**
${responses.traction_proud || 'Early stage - seeking validation'}

**6-Month Goals:**
${responses.milestone_6mo || 'Not specified'}

**Financial Position:**
Cash on hand: $${responses.cash_on_hand || 0}
Monthly burn: $${responses.monthly_burn || 0}
Runway: ${responses.cash_on_hand && responses.monthly_burn ? Math.round(responses.cash_on_hand / responses.monthly_burn) : 'Unknown'} months

**Risks & Assumptions:**
${responses.risky_assumption || 'Not specified'}

IMPORTANT: Do NOT include any title, heading, or "Founder Brief" text at the beginning. Start directly with the content sections like "## Problem & Timing". Create a professional, comprehensive brief in markdown format. Structure it with clear headings and make the content compelling while staying truthful to the provided information. Include insights and recommendations where appropriate.`;
}

function createVCPrompt(responses: any): string {
  return `You are a VC analyst creating a concise investment summary. 

Create a VC-ready summary using this information. Do NOT include a title or heading - start directly with the content sections:

**Problem & Timing:**
${responses.problem_now || 'Not specified'}

**Target Market & Go-to-Market:**
${responses.customer_gtm || 'Not specified'}

**Progress & Traction:**
${responses.traction_proud || 'Early stage - seeking validation'}

**6-Month Goals:**
${responses.milestone_6mo || 'Not specified'}

**Financial Position:**
Cash: $${responses.cash_on_hand || 0} | Burn: $${responses.monthly_burn || 0}/mo

**Risks & Assumptions:**
${responses.risky_assumption || 'Not specified'}

Create a concise, investment-focused summary in markdown format. Focus on key metrics, market opportunity, traction, and risks. Make it easy for VCs to quickly assess the opportunity.`;
}

function createConsensusBrief(gpt4Content: string, claudeContent: string, type: 'founder' | 'vc'): string {
  // For now, we'll use GPT-4 as the primary and add Claude insights as additional sections
  // In a more sophisticated implementation, we could use another AI call to synthesize both
  
  // Remove any existing titles from the content
  const cleanContent = gpt4Content.replace(/^#\s+.*?\n\n/gm, '').replace(/^\*.*?\*\n\n/gm, '');
  
  return cleanContent;
}
