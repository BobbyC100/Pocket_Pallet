import ResultTabs from "@/components/ResultTabs";

// For MVP, you can load from localStorage on client or skip this route until DB wired.
export default function BriefPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-4 text-xl font-semibold">Brief</h1>
      <ResultTabs founderMd={"_Coming soon_"} vcMd={"_Coming soon_"} />
    </main>
  );
}

