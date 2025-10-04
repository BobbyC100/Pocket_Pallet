import { NextRequest, NextResponse } from 'next/server';
import { VisionFramework, validateVisionFramework } from '@/lib/vision-framework-schema';
import { extractVisionFrameworkFromBrief } from '@/lib/vision-framework-schema';

/**
 * POST /api/vision-framework/from-brief
 * Creates a Vision Framework from existing Brief data
 * Accepts brief data + optional vision fields
 */
export async function POST(request: NextRequest) {
  try {
    const { briefData, visionPurpose, visionEndState, companyId } = await request.json();

    if (!briefData || !companyId) {
      return NextResponse.json(
        { error: 'Brief data and company ID are required' },
        { status: 400 }
      );
    }

    // Extract vision framework from brief data using intelligent mapping
    const extractedFramework = extractVisionFrameworkFromBrief(companyId, briefData);

    // Add vision fields if provided
    if (visionPurpose || visionEndState) {
      extractedFramework.vision = {
        purpose: visionPurpose || "",
        endState: visionEndState || ""
      };
    }

    // Create complete vision framework
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

    // Store in session storage (for now, in-memory)
    // In production, this would be stored in database
    const frameworkId = `draft-${companyId}-${Date.now()}`;
    
    return NextResponse.json({
      framework: validation.data,
      frameworkId,
      status: 'draft',
      version: 1,
      fromBrief: true,
      autoFilledFields: [
        'mission.whatWeDo',
        'mission.whoFor', 
        'mission.howWeWin',
        'mission.successSignals',
        'objectives[0].statement',
        'objectives[0].timespan',
        'brandBrief.positioning',
        'brandBrief.audience',
        'brandBrief.tone',
        'brandBrief.story'
      ]
    });

  } catch (error) {
    console.error('Error creating vision framework from brief:', error);
    return NextResponse.json(
      { error: 'Failed to create vision framework from brief' },
      { status: 500 }
    );
  }
}
