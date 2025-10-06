'use client'

import { SignInButton } from '@clerk/nextjs'

interface SoftSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SoftSignupModal({ isOpen, onClose }: SoftSignupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-banyan-bg-surface rounded-2xl border border-banyan-border-default shadow-banyan-high max-w-md w-full mx-4 p-8">
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
            <div className="rounded-full bg-banyan-primary/10 p-3">
              <svg className="w-8 h-8 text-banyan-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-banyan-text-default mb-3">
            Save your progress to the cloud
          </h2>

          {/* Description */}
          <p className="text-banyan-text-subtle mb-6">
            Protect your work and access it from anywhere. Sign up to save your answers and continue later.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal">
              <button className="btn-banyan-primary w-full">
                Sign up to protect my work
              </button>
            </SignInButton>
            
            <button 
              onClick={onClose}
              className="btn-banyan-ghost w-full"
            >
              Continue without signing up
            </button>
          </div>

          {/* Reassurance text */}
          <p className="text-xs text-banyan-text-subtle mt-4">
            Your answers are still saved locally if you choose to continue.
          </p>
        </div>
      </div>
    </div>
  );
}

