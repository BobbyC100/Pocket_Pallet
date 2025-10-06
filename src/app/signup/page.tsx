'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Sign up page - uses Clerk's SignUp component
 * Redirects new users to /new by default to create their first brief
 */
function SignUpContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/new';

  return (
    <div className="flex items-center justify-center min-h-screen bg-banyan-bg-base">
      <SignUp 
        redirectUrl={redirectUrl}
        afterSignUpUrl={redirectUrl}
        afterSignInUrl={redirectUrl}
        signInUrl="/login"
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-banyan-bg-base">
        <div>Loading...</div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}

