import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';
import { calculateCost, trackCost } from '@/lib/cost-tracker';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
  title: string;
  audience?: string;
  tone?: 'professional' | 'casual' | 'technical' | 'executive';
  context?: string;
}

interface Block {
  type: 'heading' | 'paragraph' | 'bullets' | 'numbered_list' | 'table';
  text?: string;
  level?: number;
  items?: string[];
  rows?: string[][];
}

/**
 * POST /api/docs-addon/generate
 * Generate structured document for Google Docs Add-on
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('X-Request-ID') || crypto.randomUUID();

  try {
    const body: GenerateRequest = await request.json();
    const { title, audience = 'general', tone = 'professional', context = '' } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] 🚀 Google Docs Add-on generation request`);
    console.log(`[${requestId}] 📝 Title: ${title}`);
    console.log(`[${requestId}] 👥 Audience: ${audience}`);
    console.log(`[${requestId}] 🎨 Tone: ${tone}`);

    // Rate limiting
    if (process.env.DISABLE_RATE_LIMIT !== 'true') {
      const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const rateLimit = checkRateLimit(identifier, RATE_LIMITS.AI_GENERATION);
      
      if (!rateLimit.allowed) {
        console.warn(`[${requestId}] ⚠️  Rate limit exceeded for ${identifier}`);
        return NextResponse.json(
          rateLimitResponse(rateLimit),
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rateLimit.retryAfter),
            }
          }
        );
      }
    }

    // Create prompt based on parameters
    const prompt = createDocumentPrompt(title, audience, tone, context);

    // Generate structured document
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert strategic document writer. Generate clear, well-structured documents." 
        },
        { role: "user", content: prompt }
      ],
      temperature: getToneTemperature(tone),
      response_format: { type: "json_object" }
    });

    const responseText = result.choices[0]?.message?.content || '{}';
    const documentData = JSON.parse(responseText);

    // Transform to add-on block format
    const blocks = transformToBlocks(documentData);

    // Track costs
    const cost = calculateCost('gpt-4o', {
      input: result.usage?.prompt_tokens || 0,
      output: result.usage?.completion_tokens || 0,
      total: result.usage?.total_tokens || 0
    });

    trackCost('docs-addon-generate', cost, {
      requestId,
      duration: Date.now() - startTime
    });

    console.log(`[${requestId}] ✅ Document generated in ${(Date.now() - startTime) / 1000}s`);
    console.log(`[${requestId}] 💰 Cost: $${cost.totalCost.toFixed(4)}`);

    return NextResponse.json({
      title: title,
      blocks: blocks,
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
    console.error(`[${requestId}] ❌ Generation error:`, error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate document',
        requestId 
      },
      { status: 500 }
    );
  }
}

/**
 * Create the generation prompt based on parameters
 */
function createDocumentPrompt(
  title: string, 
  audience: string, 
  tone: string, 
  context: string
): string {
  return `Generate a comprehensive strategic document with the following parameters:

**Title**: ${title}
**Target Audience**: ${audience}
**Tone**: ${tone}
${context ? `**Additional Context**: ${context}` : ''}

Generate a well-structured document that includes:
1. An executive summary or introduction
2. Key strategic points or sections
3. Specific recommendations or action items
4. Supporting details and explanations
5. A conclusion or next steps

The document should be appropriate for the ${audience} audience and maintain a ${tone} tone throughout.

Return the content as a JSON object with this structure:
{
  "sections": [
    {
      "heading": "Section Title",
      "level": 1,
      "content": "Section content as a paragraph",
      "subsections": [
        {
          "heading": "Subsection Title",
          "level": 2,
          "content": "Subsection content"
        }
      ],
      "bullets": ["Bullet point 1", "Bullet point 2"],
      "key_points": ["Key point 1", "Key point 2"]
    }
  ]
}

Make the content substantive, specific, and actionable. Avoid generic platitudes.`;
}

/**
 * Get temperature based on tone
 */
function getToneTemperature(tone: string): number {
  switch (tone) {
    case 'executive': return 0.5;
    case 'technical': return 0.6;
    case 'professional': return 0.7;
    case 'casual': return 0.8;
    default: return 0.7;
  }
}

/**
 * Transform API response to Google Docs block format
 */
function transformToBlocks(data: any): Block[] {
  const blocks: Block[] = [];

  // Handle different response formats
  if (data.sections && Array.isArray(data.sections)) {
    for (const section of data.sections) {
      // Add main heading
      if (section.heading) {
        blocks.push({
          type: 'heading',
          level: section.level || 1,
          text: section.heading
        });
      }

      // Add content paragraph
      if (section.content) {
        blocks.push({
          type: 'paragraph',
          text: section.content
        });
      }

      // Add bullets if present
      if (section.bullets && Array.isArray(section.bullets) && section.bullets.length > 0) {
        blocks.push({
          type: 'bullets',
          items: section.bullets
        });
      }

      // Add key points as numbered list
      if (section.key_points && Array.isArray(section.key_points) && section.key_points.length > 0) {
        blocks.push({
          type: 'numbered_list',
          items: section.key_points
        });
      }

      // Process subsections
      if (section.subsections && Array.isArray(section.subsections)) {
        for (const subsection of section.subsections) {
          if (subsection.heading) {
            blocks.push({
              type: 'heading',
              level: subsection.level || 2,
              text: subsection.heading
            });
          }
          if (subsection.content) {
            blocks.push({
              type: 'paragraph',
              text: subsection.content
            });
          }
          if (subsection.bullets && Array.isArray(subsection.bullets)) {
            blocks.push({
              type: 'bullets',
              items: subsection.bullets
            });
          }
        }
      }
    }
  }
  // Fallback: if response is just text or has different structure
  else if (typeof data === 'string') {
    blocks.push({
      type: 'paragraph',
      text: data
    });
  }
  // If response has a 'content' field
  else if (data.content) {
    blocks.push({
      type: 'paragraph',
      text: data.content
    });
  }

  return blocks;
}

/**
 * OPTIONS handler for CORS preflight (if needed)
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Request-ID',
    },
  });
}

