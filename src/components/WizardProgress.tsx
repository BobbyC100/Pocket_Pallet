type Props = {
  currentStep: number;   // 1-based if UI shows "Step 1 of N"
  totalSteps: number;
  savedLocally?: boolean;
  hasStarted?: boolean;  // true after first prompt is entered
};

export default function WizardProgress({
  currentStep,
  totalSteps,
  savedLocally = false,
  hasStarted = false,
}: Props) {
  const stepIndex = Math.max(0, Math.min(totalSteps, (currentStep ?? 1) - 1)); // 0..N
  const pct = Math.max(0, Math.min(100, (stepIndex / totalSteps) * 100));

  return (
    <section className="mx-auto mb-4 max-w-3xl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>Step {Math.max(1, stepIndex + 1)} of {totalSteps}</span>

        {/* Right-aligned, only after the first prompt */}
        {hasStarted && savedLocally && (
          <span className="text-emerald-400/90" aria-live="polite">
            ✓ Saved locally
          </span>
        )}
      </div>

      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-end text-xs text-neutral-400">
        <span>{Math.round(pct)}% Complete</span>
      </div>
    </section>
  );
}

