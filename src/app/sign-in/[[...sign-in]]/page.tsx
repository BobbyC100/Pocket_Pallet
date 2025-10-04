'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/new';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <SignIn 
        redirectUrl={redirectUrl}
        afterSignInUrl={redirectUrl}
        afterSignUpUrl={redirectUrl}
      />
    </div>
  );
}

