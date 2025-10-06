"use client";
import { useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import BriefView from "./BriefView";

interface ResultTabsProps {
  founderMd: string;
  vcMd: string;
  isAnonymous?: boolean;
  onUnlock?: () => void;
}

export default function ResultTabs({ founderMd, vcMd, isAnonymous = false, onUnlock }: ResultTabsProps) {
  const [tab, setTab] = useState<"founder" | "vc">("founder");
  
  // NOTE: VC Summary tab is hidden in initial flow per Vision Statement product spec
  // Will be reintroduced post-signup and possibly pay-gated
  const showVcTab = false;
  
  // For anonymous users, extract only the first 1-2 sections
  const getPartialContent = (fullMd: string): string => {
    const sections = fullMd.split('\n## ');
    // Show title + first section only (Problem or first section)
    const partialSections = sections.slice(0, 2);
    return partialSections.join('\n## ');
  };
  
  const displayContent = isAnonymous ? getPartialContent(tab === "founder" ? founderMd : vcMd) : (tab === "founder" ? founderMd : vcMd);
  
  return (
    <section className="rounded-2xl border border-banyan-border-default bg-banyan-bg-surface shadow-banyan-mid">
      <div className="flex items-center gap-2 border-b border-banyan-border-default p-4">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            tab === "founder" 
              ? "bg-banyan-primary text-banyan-primary-contrast" 
              : "text-banyan-text-subtle hover:text-banyan-text-default"
          }`}
          onClick={() => setTab("founder")}
        >
          Vision Statement {isAnonymous && "👁️"}
        </button>
        {showVcTab && (
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              tab === "vc" 
                ? "bg-banyan-primary text-banyan-primary-contrast" 
                : "text-banyan-text-subtle hover:text-banyan-text-default"
            }`}
            onClick={() => setTab("vc")}
          >
            VC Summary
          </button>
        )}
      </div>
      <div className="relative">
        <div className="p-6">
          <BriefView md={displayContent} />
        </div>
        
        {/* Blur overlay and unlock CTA for anonymous users */}
        {isAnonymous && (
          <div className="relative">
            {/* Blurred preview of remaining content */}
            <div className="px-6 pb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-banyan-bg-surface/80 to-banyan-bg-surface pointer-events-none z-10"></div>
              <div className="blur-sm select-none pointer-events-none opacity-50">
                <div className="space-y-4 text-banyan-text-subtle">
                  <h2 className="text-xl font-bold">## Target Market & GTM</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...</p>
                  <h2 className="text-xl font-bold">## Current Traction</h2>
                  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo...</p>
                  <h2 className="text-xl font-bold">## Financial Position</h2>
                  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla...</p>
                </div>
              </div>
            </div>
            
            {/* Unlock CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-banyan-bg-surface via-banyan-bg-surface to-transparent z-20 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
              <div className="bg-banyan-bg-surface rounded-lg p-6 border border-banyan-border-default shadow-banyan-high max-w-md">
                <div className="flex justify-center mb-3">
                  <div className="rounded-full bg-banyan-primary/10 p-3">
                    <svg className="w-6 h-6 text-banyan-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-banyan-text-default mb-2">
                  See your full Vision Statement
                </h3>
                <p className="text-sm text-banyan-text-subtle mb-4">
                  Sign up to unlock the complete version and save your work permanently.
                </p>
                <SignInButton mode="modal">
                  <button className="btn-banyan-primary w-full">
                    Sign up to unlock
                  </button>
                </SignInButton>
                <p className="text-xs text-banyan-text-subtle mt-3">
                  Free forever • No credit card required
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
