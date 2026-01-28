import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
    '/',
    '/platform',
    '/solutions',
    '/abilities',
    '/pricing',
    '/privacy',
    '/intel',
    '/sign-in',
    '/sign-up',
    '/auth/callback',
    '/api/webhooks',
    '/dashboard/geo', // GEO dashboard for development/testing
];

// Check if a path matches public routes
function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(route => {
        if (route.endsWith('*')) {
            return pathname.startsWith(route.slice(0, -1));
        }
        return pathname === route || pathname.startsWith(route + '/');
    });
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // DEV MODE: If Supabase is not configured, allow all requests
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
        console.log('⚠️ DEV MODE: Supabase not configured, bypassing auth for', request.nextUrl.pathname);
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if exists
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Check if route requires authentication
    const pathname = request.nextUrl.pathname;

    // Skip auth check for static files and public routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/webhooks') ||
        pathname.includes('.') ||
        isPublicRoute(pathname)
    ) {
        return supabaseResponse;
    }

    // Redirect to sign-in if not authenticated and trying to access protected route
    if (!user && !isPublicRoute(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = '/sign-in';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
