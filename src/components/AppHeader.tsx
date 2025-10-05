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
    <header style={{ background: 'var(--surface)', borderBottom: 'var(--divider)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold link-underline" style={{ color: 'var(--text)' }}>
          Banyan
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/new" className="link-underline" style={{ padding: '0.5rem 0.75rem', color: 'var(--text)' }}>
            New Brief
          </Link>
          
          {mounted && (
            <>
              <SignedIn>
                <Link href="/sos" className="link-underline" style={{ padding: '0.5rem 0.75rem', color: 'var(--text)' }}>
                  Documents
                </Link>
              </SignedIn>
            </>
          )}
          
          <Link href="/showcase" className="link-underline" style={{ padding: '0.5rem 0.75rem', color: 'var(--text)' }}>
            Examples
          </Link>

          {mounted && (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn--ghost" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
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

