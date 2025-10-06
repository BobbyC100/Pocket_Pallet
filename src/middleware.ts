import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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
  '/login(.*)',
  '/signup(.*)',
  '/demo',
  '/pricing',
  '/help',
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
  // Generate unique request ID for tracing
  const requestId = uuidv4();
  const startTime = Date.now();
  
  // Log request with ID
  console.log(`[${requestId}] ${request.method} ${request.url}`);
  
  // Protect private routes
  if (isPrivateRoute(request)) {
    await auth.protect();
  }
  
  // Create response with request ID header
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);
  
  // Log request completion time
  const duration = Date.now() - startTime;
  console.log(`[${requestId}] Completed in ${duration}ms`);
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

