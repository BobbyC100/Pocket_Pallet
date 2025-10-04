import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  VisionFrameworkV2,
  validateVisionFrameworkV2,
  createVisionFrameworkPrompt,
  createExecutiveOnePagerPrompt
} from '@/lib/vision-framework-schema-v2';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { companyId, responses } = await request.json();

    console.log('🚀 Starting Vision Framework V2 generation with GPT-4');
    console.log('📝 Company:', companyId);

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

    return NextResponse.json({
      status: 'success',
      framework: completeFramework,
      executiveOnePager,
      metadata: {
        modelsUsed: ['gpt-4-turbo-preview'],
        qaChecks: qaResults,
        generatedAt: new Date().toISOString()
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

