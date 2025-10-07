'use client';

import { useRouter, usePathname } from 'next/navigation';
import { SignIn, useSignIn } from '@clerk/nextjs';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComplete?: () => void;
  returnTo?: string; // Optional: specify custom return URL
}

export default function SaveModal({ isOpen, onClose, onSaveComplete, returnTo }: SaveModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signIn } = useSignIn();

  if (!isOpen) return null;

  // Use provided returnTo, or default to current page
  const redirectUrl = returnTo || pathname || '/results';

  const handleEmailSignIn = () => {
    // Redirect to sign-in with a return URL back to current page
    router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: redirectUrl,
        redirectUrlComplete: redirectUrl,
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-banyan-bg-surface rounded-lg shadow-banyan-high max-w-md w-full p-6 relative border border-banyan-border-default">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-banyan-text-subtle hover:text-banyan-text-default transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-banyan-text-default mb-2">
              Save and expand your Vision.
            </h2>
            <p className="text-banyan-text-subtle text-sm">
              Sign up to unlock your full Vision Framework and strategic tools.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            {/* Email (Magic Link) */}
            <button
              onClick={handleEmailSignIn}
              className="w-full btn-banyan-primary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Continue with Email
            </button>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full btn-banyan-ghost flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Fine print */}
          <p className="text-xs text-banyan-text-subtle text-center mt-4">
            We only ask for Google when you export to Docs.
          </p>
        </div>
      </div>
    </>
  );
}

