'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/new';

  return (
    <div className="flex items-center justify-center min-h-screen bg-banyan-bg-base p-6">
      <SignUp 
        redirectUrl={redirectUrl}
        afterSignInUrl={redirectUrl}
        afterSignUpUrl={redirectUrl}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-banyan-bg-surface shadow-banyan-high",
            headerTitle: "text-banyan-text-default",
            headerSubtitle: "text-banyan-text-subtle",
            socialButtonsBlockButton: "border-banyan-border-default hover:bg-banyan-mist",
            formButtonPrimary: "bg-banyan-primary hover:bg-banyan-primary-hover text-banyan-primary-contrast",
            formFieldInput: "border-banyan-border-default text-banyan-text-default bg-banyan-bg-surface",
            formFieldLabel: "text-banyan-text-default",
            footerActionLink: "text-banyan-primary hover:text-banyan-primary-hover",
            identityPreviewText: "text-banyan-text-default",
            identityPreviewEditButton: "text-banyan-primary",
          }
        }}
      />
    </div>
  );
}
