import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (default allow)
const isPublicRoute = createRouteMatcher([
  '/',
  '/new',
  '/brief/:id',
  '/example',
  '/showcase',
  '/sos',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/generate-brief',
  '/api/vision-framework-v2/generate',
  '/api/vision-framework/generate',
]);

// Define private routes that require authentication
const isPrivateRoute = createRouteMatcher([
  '/account(.*)',
  '/settings(.*)',
  '/dashboard',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect private routes
  if (isPrivateRoute(request)) {
    await auth.protect();
  }
  // Public routes are accessible to everyone
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

