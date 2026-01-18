import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/api/webhooks/stripe']);

// In Next.js 16, this file is renamed to proxy.ts and the export is 'proxy'
export const proxy = clerkMiddleware(async (auth, request) => {
    // We allow the root page '/' to be public for the landing section, 
    // but the SignedIn/SignedOut components in page.tsx handle granular visibility.
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export default proxy; // Maintaining default for compatibility if needed, but 'proxy' is the primary export

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
