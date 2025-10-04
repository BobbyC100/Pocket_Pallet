"use client";
import { SAMPLE_FOUNDER_MD, SAMPLE_VC_MD } from "@/components/SampleBrief";
import ResultTabs from "@/components/ResultTabs";

export default function ExamplePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-xl font-semibold">Example Banyan Brief</h1>
      <p className="mb-6 mt-1 text-zinc-600">6 prompts in, 1 investor-ready page out.</p>
      <ResultTabs founderMd={SAMPLE_FOUNDER_MD} vcMd={SAMPLE_VC_MD} />
      <div className="mt-6">
        <a href="/new" className="rounded-lg bg-black px-4 py-2 text-white">Create Your Brief</a>
      </div>
    </main>
  );
}

