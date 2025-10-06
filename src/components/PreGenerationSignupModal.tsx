'use client'

import { SignInButton } from '@clerk/nextjs'

interface PreGenerationSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function PreGenerationSignupModal({ isOpen, onClose, onContinue }: PreGenerationSignupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-banyan-bg-surface rounded-2xl border border-banyan-border-default shadow-banyan-high max-w-lg w-full mx-4 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-banyan-text-subtle hover:text-banyan-text-default transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-banyan-primary/10 p-4">
              <svg className="w-10 h-10 text-banyan-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-banyan-text-default mb-3">
            Sign up to permanently save your Vision Statement
          </h2>

          {/* Description */}
          <p className="text-banyan-text-subtle mb-6">
            We're about to generate your Vision Statement. Sign up now to save it to your account and access it from anywhere.
          </p>

          {/* Benefits */}
          <div className="bg-banyan-bg-base rounded-lg p-4 mb-6 text-left">
            <ul className="space-y-2 text-sm text-banyan-text-default">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-banyan-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Permanently save your Vision Statement</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-banyan-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access from any device</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-banyan-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlock full Vision Statement and strategic tools</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal">
              <button className="btn-banyan-primary w-full">
                Sign up and generate
              </button>
            </SignInButton>
            
            <button 
              onClick={() => {
                onClose();
                onContinue();
              }}
              className="btn-banyan-ghost w-full"
            >
            Continue without signing up
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

