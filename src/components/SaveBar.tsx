"use client";

import { useState, useEffect } from "react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface SaveBarProps {
  onSave: () => void;
  hasUnsavedChanges?: boolean;
}

export function SaveBar({ onSave, hasUnsavedChanges = true }: SaveBarProps) {
  const { isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted || !isLoaded || !hasUnsavedChanges) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 border-t border-banyan-border-default backdrop-blur shadow-banyan-high z-50"
      style={{ backgroundColor: 'var(--banyan-bg-surface)', opacity: 0.98 }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-banyan-warning rounded-full animate-pulse"></div>
          <span className="text-sm text-banyan-text-subtle">Your changes are not saved.</span>
        </div>

        <SignedIn>
          <button 
            onClick={onSave} 
            className="btn-banyan-primary"
          >
            Save
          </button>
        </SignedIn>

        <SignedOut>
          <SignInButton 
            mode="modal"
            fallbackRedirectUrl="/new"
            forceRedirectUrl="/new"
          >
            <button className="btn-banyan-primary">
              Sign in to save
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

