import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { VisionFramework, createEmptyVisionFramework, validateVisionFramework } from '@/lib/vision-framework-schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { companyId, responses } = await request.json();

    if (!companyId || !responses) {
      return NextResponse.json(
        { error: 'Company ID and responses are required' },
        { status: 400 }
      );
    }

    // Use intelligent mapping to extract vision framework from wizard responses
    const { extractVisionFrameworkFromBrief } = await import('@/lib/vision-framework-schema');
    const extractedFramework = extractVisionFrameworkFromBrief(companyId, responses);

    // Create the complete vision framework with metadata using intelligent extraction
    const completeFramework: VisionFramework = {
      ...extractedFramework,
      companyId,
      updatedAt: new Date().toISOString()
    } as VisionFramework;

    // Validate the complete vision framework
    const validation = validateVisionFramework(completeFramework);
    if (!validation.success) {
      console.error('Vision framework validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Generated vision framework failed validation',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      framework: validation.data,
      status: 'draft',
      version: 1
    });

  } catch (error) {
    console.error('Error generating vision framework:', error);
    return NextResponse.json(
      { error: 'Failed to generate vision framework' },
      { status: 500 }
    );
  }
}