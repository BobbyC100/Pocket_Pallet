import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { VisionFrameworkV2 } from '@/lib/vision-framework-schema-v2';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      section, 
      currentContent, 
      feedback, 
      originalResponses, 
      fullFramework 
    } = await request.json();

    console.log('🔄 Starting refinement for section:', section);
    console.log('📝 User feedback:', feedback);

    const refinementPrompt = createRefinementPrompt(
      section,
      currentContent,
      feedback,
      originalResponses,
      fullFramework
    );

    // Use faster model for simple refinements (More Specific, More Concise)
    // Use GPT-4 for complex refinements (Different Angle, Add Detail, Regenerate)
    const isSimpleRefinement = 
      feedback.includes('more specific') || 
      feedback.includes('more concise') ||
      feedback.includes('Make this more specific') ||
      feedback.includes('Make this more concise');
    
    const model = isSimpleRefinement ? "gpt-3.5-turbo" : "gpt-4-turbo-preview";
    const temperature = isSimpleRefinement ? 0.5 : 0.7;

    console.log(`⚡ Using ${model} for ${isSimpleRefinement ? 'fast' : 'complex'} refinement`);

    const result = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: refinementPrompt }],
      temperature,
      response_format: { type: "json_object" }
    });

    const refinedText = result.choices[0]?.message?.content || '{}';
    const refinedData = JSON.parse(refinedText);

    console.log('✅ Refinement complete');

    return NextResponse.json({
      status: 'success',
      section,
      refinedContent: refinedData.refined,
      suggestions: refinedData.suggestions || [],
      quality: refinedData.quality || {}
    });

  } catch (error) {
    console.error('❌ Refinement error:', error);
    return NextResponse.json(
      {
        error: 'Failed to refine section',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function createRefinementPrompt(
  section: string,
  currentContent: any,
  feedback: string,
  originalResponses: any,
  fullFramework: VisionFrameworkV2
): string {
  const sectionGuidance: Record<string, string> = {
    vision: `
**Vision Guidelines:**
- Should be 2-3 powerful sentences
- Aspirational but grounded in reality
- Should answer: "What world are we creating?"
- Avoid generic phrases like "revolutionize" or "transform"
- Use concrete, vivid language
`,
    strategy: `
**Strategy Guidelines:**
- 2-5 strategic pillars (HOW you'll win)
- Each 10-30 words
- Should be specific to your market/approach
- Not what you do, but HOW you'll dominate
- Examples: "Focus on X market before Y", "Build network effects through Z"
`,
    operating_principles: `
**Operating Principles Guidelines:**
- 3-7 cultural DNA statements
- Each 10-25 words
- Should guide decision-making
- Not generic ("work hard") but specific to your company
- Format: "X over Y" or "We believe Z, so we do A"
`,
    near_term_bets: `
**Near-term Bets Guidelines:**
- 2-8 concrete commitments (next 6-12 months)
- Each bet needs: specific action + owner + timeline + measure
- Should be risky enough to matter
- Measurable enough to know if you won
- Not todo items, but strategic bets
`,
    metrics: `
**Metrics Guidelines:**
- 3-12 things you'll actually track
- Mix of leading and lagging indicators
- Each needs: name + target + cadence (daily/weekly/monthly/quarterly/milestone)
- Should connect to your bets and strategy
- Avoid vanity metrics
`,
    tensions: `
**Tensions Guidelines:**
- 0-10 real contradictions in your strategy
- Each 10-30 words
- Should be genuine trade-offs, not theoretical
- Format: "X vs Y creates Z tension"
- Examples: "Move fast vs measure twice", "Premium positioning vs rapid growth"
`
  };

  return `You are refining the **${section}** section of a Vision Framework based on user feedback.

**Original Context (What the founder said):**
${JSON.stringify(originalResponses, null, 2)}

**Full Framework (for context):**
${JSON.stringify(fullFramework, null, 2)}

**Current ${section} Content:**
${JSON.stringify(currentContent, null, 2)}

**User's Feedback:**
"${feedback}"

${sectionGuidance[section] || ''}

---

**Your Task:**

1. **Understand the feedback** - What is the user asking for? More specificity? Different angle? Additional detail?

2. **Refine the content** - Improve based on feedback while:
   - Staying true to the founder's original responses
   - Following the section guidelines above
   - Maintaining consistency with the rest of the framework
   - Being MORE specific, not MORE generic

3. **Assess quality** - Rate the refined content on:
   - Specificity (1-10): Is it concrete or generic?
   - Actionability (1-10): Can someone act on this?
   - Alignment (1-10): Does it match the founder's intent? **⭐ MOST CRITICAL**
   - Measurability (1-10): Only for bets/metrics sections - is success measurable?

**IMPORTANT: Alignment is Weighted 2x**
Alignment is the most critical factor. A misaligned framework (even if specific) is worse than a vague but on-brand one.

**Calculate overallScore using this weighted formula:**
- For sections with measurability: \`overallScore = (Specificity × 1 + Actionability × 1 + Alignment × 2 + Measurability × 1) / 5\`
- For other sections: \`overallScore = (Specificity × 1 + Actionability × 1 + Alignment × 2) / 4\`

**Return JSON:**

\`\`\`json
{
  "refined": ${section === 'vision' ? '"string (the refined vision)"' : section === 'near_term_bets' || section === 'metrics' ? '[...array of refined objects...]' : '[...array of refined strings...]'},
  "suggestions": [
    "Optional: Additional improvement ideas for the user",
    "Optional: Things to consider for other sections"
  ],
  "quality": {
    "specificity": 8,
    "actionability": 7,
    "alignment": 9,
    "measurability": ${section === 'near_term_bets' || section === 'metrics' ? '8' : '0'},
    "overallScore": 8.25,
    "issues": [],
    "suggestions": ["What could still be improved?"],
    "strengths": ["What's particularly strong about this refined version?"]
  }
}
\`\`\`

Example calculation for vision: \`(8 × 1 + 7 × 1 + 9 × 2) / 4 = 33 / 4 = 8.25\`

**Important:**
- If the feedback is vague, interpret it generously and make the content better
- If asking to "be more specific", add concrete details from their original responses
- If asking to "regenerate", create something fresh but aligned
- Keep the same data structure (string, array of strings, or array of objects)
`;
}

