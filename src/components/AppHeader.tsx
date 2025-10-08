"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-black/5 dark:border-white/10 transition-colors duration-300">
      <nav 
        aria-label="Primary navigation" 
        className="mx-auto max-w-7xl h-16 flex items-center justify-between px-4 md:px-6 lg:px-8"
      >
        {/* Left: Brand */}
        <Link 
          href="/" 
          className="font-semibold tracking-tight text-gray-900 dark:text-white hover:opacity-90 transition-all duration-150 ease-in-out" 
          aria-label="Banyan Home"
        >
          BanyanAI
        </Link>

        {/* Right cluster - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-150 ease-in-out">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="inline-flex items-center justify-center h-9 px-4 rounded-2xl text-sm font-medium bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition-all duration-150 ease-in-out">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center h-9 px-4 rounded-2xl text-sm font-medium bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition-all duration-150 ease-in-out"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          )}

          {/* Globe menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open menu"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition-all duration-150 ease-in-out cursor-pointer"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                <path 
                  d="M3 4.5L6 7.5L9 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>

            {menuOpen && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                
                {/* Menu dropdown */}
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-1.5 z-20"
                >
                  <MenuItem 
                    href="/pricing" 
                    label="Plans / Cost" 
                    onSelect={() => setMenuOpen(false)} 
                  />
                  <MenuItem 
                    href="/settings" 
                    label="Settings" 
                    onSelect={() => setMenuOpen(false)} 
                  />
                  <MenuItem 
                    href="/help" 
                    label="Help / Knowledge" 
                    onSelect={() => setMenuOpen(false)} 
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 transition-all duration-150 ease-in-out cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-40">
            <div className="px-4 py-2 space-y-1">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button 
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all duration-150 ease-in-out"
                    >
                      Log in
                    </button>
                  </SignInButton>
                  <MobileMenuItem href="/pricing" label="Plans / Cost" onSelect={() => setMenuOpen(false)} />
                  <MobileMenuItem href="/settings" label="Settings" onSelect={() => setMenuOpen(false)} />
                  <MobileMenuItem href="/help" label="Help / Knowledge" onSelect={() => setMenuOpen(false)} />
                  <div className="pt-2">
                    <SignUpButton mode="modal">
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="block w-full text-center py-2 px-4 rounded-2xl text-sm font-medium bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-700 transition-all duration-150 ease-in-out"
                      >
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </>
              ) : (
                <>
                  <MobileMenuItem href="/dashboard" label="Dashboard" onSelect={() => setMenuOpen(false)} />
                  <MobileMenuItem href="/pricing" label="Plans / Cost" onSelect={() => setMenuOpen(false)} />
                  <MobileMenuItem href="/settings" label="Settings" onSelect={() => setMenuOpen(false)} />
                  <MobileMenuItem href="/help" label="Help / Knowledge" onSelect={() => setMenuOpen(false)} />
                  <div className="pt-2 flex items-center justify-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// Desktop menu item component
function MenuItem({ 
  href, 
  label, 
  onSelect 
}: { 
  href: string; 
  label: string; 
  onSelect: () => void 
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      role="menuitem"
      className="block rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150 ease-in-out cursor-pointer"
    >
      {label}
    </Link>
  );
}

// Mobile menu item component
function MobileMenuItem({ 
  href, 
  label, 
  onSelect 
}: { 
  href: string; 
  label: string; 
  onSelect: () => void 
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="block rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150 ease-in-out"
    >
      {label}
    </Link>
  );
}

