"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Banyan
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/new" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            New Brief
          </Link>
          <Link href="/sos" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            Documents
          </Link>
          <Link href="/showcase" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
            Examples
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
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
        </nav>
      </div>
    </header>
  );
}

