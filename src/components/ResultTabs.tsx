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
  
  // CHANGED: Show full content to all users (anonymous or not)
  // Auth gating now happens on Save/Generate actions, not viewing
  const displayContent = tab === "founder" ? founderMd : vcMd;
  
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
          Vision Statement
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
        
        {/* REMOVED: Anonymous user gating modal */}
        {/* Users can now view full Vision Statement immediately */}
        {/* Auth gating moved to Save/Generate actions */}
      </div>
    </section>
  );
}
