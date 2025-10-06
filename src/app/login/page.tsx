'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

/**
 * Login page - uses Clerk's SignIn component
 * Redirects authenticated users to /new by default
 */
export default function LoginPage() {
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

