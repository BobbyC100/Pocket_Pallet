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
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur shadow-lg z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <span className="text-sm text-gray-600">Your changes are not saved.</span>

        <SignedIn>
          <button 
            onClick={onSave} 
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors font-medium"
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
            <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors font-medium">
              Sign in to save
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

