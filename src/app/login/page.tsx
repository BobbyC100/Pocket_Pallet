'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Login page - uses Clerk's SignIn component
 * Redirects authenticated users to /new by default
 */
function LoginContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/new';

  return (
    <div className="flex items-center justify-center min-h-screen bg-banyan-bg-base">
      <SignIn 
        redirectUrl={redirectUrl}
        afterSignInUrl={redirectUrl}
        afterSignUpUrl={redirectUrl}
        signUpUrl="/signup"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-banyan-bg-base">
        <div>Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

