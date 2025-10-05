"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export function AppHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-banyan-bg-surface border-b border-banyan-border-default">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold link-underline text-banyan-text-default">
          Banyan
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/new" className="link-underline px-3 py-2 text-banyan-text-default">
            New Brief
          </Link>
          
          {mounted && (
            <>
              <SignedIn>
                <Link href="/sos" className="link-underline px-3 py-2 text-banyan-text-default">
                  Documents
                </Link>
              </SignedIn>
            </>
          )}
          
          <Link href="/showcase" className="link-underline px-3 py-2 text-banyan-text-default">
            Examples
          </Link>

          {mounted && (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-banyan-ghost">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-banyan-primary">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  appearance={{ 
                    elements: { 
                      userButtonTrigger: "ring-0 hover:opacity-80 transition-opacity" 
                    } 
                  }}
                  afterSignOutUrl="/"
                />
              </SignedIn>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

