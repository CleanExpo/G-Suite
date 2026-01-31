import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/push/unsubscribe
 *
 * Remove push notification subscriptions for the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all subscriptions for this user
    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Failed to delete push subscription:', dbError);
      // If table doesn't exist, still return success
      if (dbError.code === '42P01') {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
