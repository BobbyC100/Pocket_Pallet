import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  VisionFrameworkV2,
  validateVisionFrameworkV2,
  createVisionFrameworkPrompt,
  createExecutiveOnePagerPrompt
} from '@/lib/vision-framework-schema-v2';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { companyId, responses } = await request.json();

    console.log('🚀 Starting Vision Framework V2 generation with Gemini 1.5 Pro');
    console.log('📝 Company:', companyId);

    // Step 1: Gemini 1.5 Pro generates the framework with contradiction detection
    console.log('Step 1: Gemini 1.5 Pro mapping sections and detecting tensions...');
    const geminiFlash = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest"
    });
    
    const frameworkPrompt = createVisionFrameworkPrompt(responses);
    const frameworkResult = await geminiFlash.generateContent(frameworkPrompt);
    const frameworkText = frameworkResult.response.text();
    
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

    // Step 3: Create executive one-pager (use same Flash model)
    console.log('Step 3: Creating executive one-pager...');
    const onePagerPrompt = createExecutiveOnePagerPrompt(completeFramework);
    const onePagerResult = await geminiFlash.generateContent(onePagerPrompt);
    const executiveOnePager = onePagerResult.response.text();
    
    console.log('✅ Executive one-pager generated');

    // Step 4: QA checks (use same Flash model)
    console.log('Step 4: Running QA checks...');
    const qaResults = await performQAChecks(geminiFlash, completeFramework);
    console.log('✅ QA checks complete');

    return NextResponse.json({
      status: 'success',
      framework: completeFramework,
      executiveOnePager,
      metadata: {
        modelsUsed: ['gemini-1.5-pro-latest'],
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
async function performQAChecks(geminiFlash: any, framework: VisionFrameworkV2) {
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
    const result = await geminiFlash.generateContent(qaPrompt);
    const text = result.response.text();
    
    // Extract JSON
    const jsonMatch = text.match(/\`\`\`json\s*([\s\S]*?)\`\`\`/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try parsing whole response
    return JSON.parse(text);
  } catch (error) {
    console.error('QA check error:', error);
    return { error: 'QA checks failed', details: error instanceof Error ? error.message : 'Unknown' };
  }
}

