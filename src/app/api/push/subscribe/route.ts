import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/push/subscribe
 *
 * Save a push notification subscription for the current user.
 * Stores the subscription endpoint and keys in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse subscription data
    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Store subscription in database
    // Using upsert to update existing subscription if endpoint matches
    const { error: dbError } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,endpoint',
        ignoreDuplicates: false,
      },
    );

    if (dbError) {
      console.error('Failed to save push subscription:', dbError);
      // If table doesn't exist, still return success (graceful degradation)
      if (dbError.code === '42P01') {
        console.warn('push_subscriptions table not found - skipping save');
        return NextResponse.json({ success: true, warning: 'Storage not configured' });
      }
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
