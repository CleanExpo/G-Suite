import { createClient } from '@/lib/supabase/server';

/**
 * Get the current authenticated user from Supabase.
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get the current user ID or throw if not authenticated.
 * Use this in server actions that require authentication.
 */
export async function requireAuth() {
    const user = await getAuthUser();

    if (!user) {
        throw new Error('Unauthorized: No active session');
    }

    return {
        userId: user.id,
        email: user.email,
        user,
    };
}

/**
 * Check if Supabase is configured for authentication.
 */
export function isSupabaseConfigured(): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE');
}

/**
 * Get user ID for actions - returns dev user ID if Supabase not configured.
 * Use this to allow dev mode without real authentication.
 */
export async function getAuthUserIdOrDev(): Promise<string> {
    if (!isSupabaseConfigured()) {
        // Dev mode: return a mock user ID
        console.warn('⚠️ DEV MODE: Using mock user ID');
        return 'dev_user_001';
    }

    const { userId } = await requireAuth();
    return userId;
}
