'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/new';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <SignUp 
        redirectUrl={redirectUrl}
        afterSignInUrl={redirectUrl}
        afterSignUpUrl={redirectUrl}
      />
    </div>
  );
}
