import { createClient } from '@supabase/supabase-js';
import { getDraftsForMigration, clearAllDrafts, clearAnonymousId, getAnonymousId } from './anonymous-session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Migrate all localStorage drafts to authenticated user account
 */
export async function migrateDraftsToAccount(clerkUserId: string): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const drafts = getDraftsForMigration();
  const anonymousId = getAnonymousId();
  const errors: string[] = [];
  let migratedCount = 0;

  if (drafts.length === 0) {
    return { success: true, migratedCount: 0, errors: [] };
  }

  try {
    // Get or create user in database
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (!user) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkUserId,
          auth_provider: 'email',
          anonymous_id: anonymousId,
        })
        .select('id')
        .single();

      if (userError) {
        errors.push(`Failed to create user: ${userError.message}`);
        return { success: false, migratedCount: 0, errors };
      }

      user = newUser;
    }

    // Migrate each draft
    for (const draft of drafts) {
      try {
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            type: draft.type,
            title: draft.title,
            content_json: draft.contentJson,
            metadata: {
              ...draft.metadata,
              migratedFrom: 'localStorage',
              originalCreatedAt: draft.createdAt,
            },
          });

        if (insertError) {
          errors.push(`Failed to migrate draft: ${insertError.message}`);
        } else {
          migratedCount++;
        }
      } catch (error) {
        errors.push(`Unexpected error migrating draft: ${error}`);
      }
    }

    // Log migration event
    await supabase
      .from('events_audit')
      .insert({
        user_id: user.id,
        anonymous_id: anonymousId,
        event_type: 'upgraded_account',
        event_data: {
          migratedDrafts: migratedCount,
          totalDrafts: drafts.length,
        },
      });

    // Clear localStorage after successful migration
    if (migratedCount > 0) {
      clearAllDrafts();
      clearAnonymousId();
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors,
    };
  } catch (error) {
    errors.push(`Migration failed: ${error}`);
    return { success: false, migratedCount: 0, errors };
  }
}

