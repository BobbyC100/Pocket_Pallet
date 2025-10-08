export default function IntroHero() {
  return (
    <section className="mx-auto mb-8 max-w-3xl text-center">
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-neutral-950/40 px-8 py-10 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Clarity creates <span className="text-emerald-400">possibility</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-neutral-300">
          BanyanAI turns instinct into structure — helping founders articulate their vision,
          align their team, and move faster with purpose.
        </p>
      </div>
      <div className="mx-auto mt-6 h-px w-24 bg-neutral-800" />
    </section>
  );
}

