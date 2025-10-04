import { NextRequest, NextResponse } from 'next/server';
import { VisionFramework, createEmptyVisionFramework, validateVisionFramework } from '@/lib/vision-framework-schema';

// In-memory storage for now (replace with database later)
const visionFrameworks: Map<string, VisionFramework> = new Map();

/**
 * GET /api/vision-framework/[companyId]
 * Retrieve the vision framework for a company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const framework = visionFrameworks.get(companyId);
    
    if (!framework) {
      // Return empty framework for new companies
      const emptyFramework = createEmptyVisionFramework(companyId);
      return NextResponse.json(emptyFramework);
    }

    return NextResponse.json(framework);
  } catch (error) {
    console.error('Error fetching vision framework:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vision framework' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vision-framework/[companyId]
 * Update the vision framework for a company
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
    const updates = await request.json();
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get existing framework or create new one
    const existingFramework = visionFrameworks.get(companyId) || createEmptyVisionFramework(companyId);
    
    // Merge updates with existing framework
    const updatedFramework: VisionFramework = {
      ...existingFramework,
      ...updates,
      companyId,
      updatedAt: new Date().toISOString()
    };

    // Validate the updated framework
    const validation = validateVisionFramework(updatedFramework);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Store the updated framework
    visionFrameworks.set(companyId, updatedFramework);

    return NextResponse.json(updatedFramework);
  } catch (error) {
    console.error('Error updating vision framework:', error);
    return NextResponse.json(
      { error: 'Failed to update vision framework' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vision-framework/[companyId]/generate
 * Generate vision framework from existing brief data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
    const { briefData } = await request.json();
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!briefData) {
      return NextResponse.json(
        { error: 'Brief data is required' },
        { status: 400 }
      );
    }

    // Import the extraction function
    const { extractVisionFrameworkFromBrief } = await import('@/lib/vision-framework-schema');
    
    // Generate framework from brief data
    const generatedFramework = extractVisionFrameworkFromBrief(companyId, briefData);
    
    // Store the generated framework
    visionFrameworks.set(companyId, generatedFramework as VisionFramework);

    return NextResponse.json(generatedFramework);
  } catch (error) {
    console.error('Error generating vision framework:', error);
    return NextResponse.json(
      { error: 'Failed to generate vision framework' },
      { status: 500 }
    );
  }
}