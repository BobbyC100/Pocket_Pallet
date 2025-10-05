"use client";
import { useState } from "react";
import BriefView from "./BriefView";

export default function ResultTabs({ founderMd, vcMd }: { founderMd: string; vcMd: string }) {
  const [tab, setTab] = useState<"founder" | "vc">("founder");
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
          Founder Brief
        </button>
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
      </div>
      <div className="p-6">
        <BriefView md={tab === "founder" ? founderMd : vcMd} />
      </div>
    </section>
  );
}
