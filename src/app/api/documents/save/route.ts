import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, contentJson, metadata } = body;

    // Check if user exists in database, create if not
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    let dbUserId = existingUser?.id;

    if (!existingUser) {
      // Create user in database
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          auth_provider: 'email', // Will update based on actual provider
        })
        .select('id')
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      dbUserId = newUser.id;
    }

    // Save document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: dbUserId,
        type,
        title,
        content_json: contentJson,
        metadata,
      })
      .select()
      .single();

    if (docError) {
      console.error('Error saving document:', docError);
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      );
    }

    // Log event
    await supabase
      .from('events_audit')
      .insert({
        user_id: dbUserId,
        event_type: 'saved_brief',
        event_data: { document_id: document.id, type },
      });

    return NextResponse.json({ 
      success: true, 
      document 
    });
  } catch (error) {
    console.error('Save document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

