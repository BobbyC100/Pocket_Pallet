'use client';

import { SignedIn, SignedOut, UserProfile } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Settings page - User account and preferences
 * Auth-gated via Clerk
 */
export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-banyan-bg-base">
      <SignedOut>
        {/* Show message to sign in */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-6">
            <h1 className="text-2xl font-bold text-banyan-text-default">Sign in to access settings</h1>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              You need to be signed in to view and manage your account settings.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="btn-banyan-primary"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* User profile component from Clerk */}
        <main className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-banyan-text-default">Settings</h1>
            <p className="mt-2 text-sm text-banyan-text-subtle">
              Manage your account, preferences, and security settings.
            </p>
          </div>
          
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-banyan-mid border border-banyan-border-default bg-banyan-bg-surface",
              }
            }}
          />
        </main>
      </SignedIn>
    </div>
  );
}

