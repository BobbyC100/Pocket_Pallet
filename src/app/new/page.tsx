"use client";
import { Suspense } from "react";
import PromptWizard from "@/components/PromptWizard";

export default function NewPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banyan-primary mx-auto mb-4"></div>
            <p className="text-banyan-text-subtle">Loading wizard...</p>
          </div>
        </div>
      }>
        <PromptWizard />
      </Suspense>
    </main>
  );
}
