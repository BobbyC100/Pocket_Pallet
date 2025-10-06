import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

/**
 * GET /api/documents
 * Fetch all documents for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      // User not in database yet, return empty array
      return NextResponse.json({ documents: [] });
    }

    // Fetch all documents for this user
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, user.id))
      .orderBy(desc(documents.updatedAt));

    // Transform documents for frontend
    const transformedDocs = userDocuments.map(doc => ({
      id: doc.id,
      type: doc.type,
      title: doc.title || 'Untitled',
      contentJson: doc.contentJson,
      metadata: doc.metadata,
      isPublic: doc.isPublic,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({ documents: transformedDocs });
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Save a new document or update existing one
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, type, title, contentJson, metadata } = body;

    if (!type || !contentJson) {
      return NextResponse.json(
        { error: 'Missing required fields: type, contentJson' },
        { status: 400 }
      );
    }

    // Find or create user in database
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) {
      // Create user if doesn't exist
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId,
          authProvider: 'email', // Default, update based on Clerk provider if needed
        })
        .returning();
      user = newUser;
    }

    if (id) {
      // Update existing document
      const [updated] = await db
        .update(documents)
        .set({
          title,
          contentJson,
          metadata,
          updatedAt: new Date(),
        })
        .where(and(
          eq(documents.id, id),
          eq(documents.userId, user.id)
        ))
        .returning();

      if (!updated) {
        return NextResponse.json(
          { error: 'Document not found or unauthorized' },
          { status: 404 }
        );
      }

      return NextResponse.json({ document: updated });
    } else {
      // Create new document
      const [newDoc] = await db
        .insert(documents)
        .values({
          userId: user.id,
          type,
          title: title || 'Untitled',
          contentJson,
          metadata,
        })
        .returning();

      return NextResponse.json({ document: newDoc });
    }
  } catch (error) {
    console.error('❌ Error saving document:', error);
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    );
  }
}

