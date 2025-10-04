import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/new',
  '/brief/:id',
  '/dashboard',
  '/example',
  '/showcase',
  '/sos',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/generate-brief',
  '/api/vision-framework-v2/generate',
  '/api/vision-framework/generate',
]);

export default clerkMiddleware(async (auth, request) => {
  // For now, make everything public during development
  // We'll add protection after the save flow is complete
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

