type Props = {
  currentStep: number;
  totalSteps: number;
  savedLocally?: boolean;
};

export default function WizardProgress({ currentStep, totalSteps, savedLocally }: Props) {
  const stepIndex = Math.max(0, Math.min(totalSteps, (currentStep ?? 1) - 1));
  const pct = Math.max(0, Math.min(100, (stepIndex / totalSteps) * 100));

  return (
    <section className="mx-auto mb-4 max-w-3xl">
      {/* Compact local-save indicator */}
      {savedLocally && (
        <p className="mb-2 text-xs text-emerald-400/90">
          ✓ Answers saved locally
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>Step {Math.max(1, stepIndex + 1)} of {totalSteps}</span>
        <span>{Math.round(pct)}% Complete</span>
      </div>

      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}

