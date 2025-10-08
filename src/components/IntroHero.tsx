"use client";
import { motion } from "framer-motion";

export default function IntroHero() {
  return (
    <section className="mx-auto mb-10 max-w-5xl px-4 text-left">
      <div className="rounded-3xl border border-neutral-800/70 bg-gradient-to-b from-neutral-900/70 to-neutral-950/40 px-8 py-14 md:py-20 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <h1 className="font-semibold tracking-tight text-white
                       text-[clamp(2rem,3.5vw+0.5rem,3.25rem)] leading-tight">
          Clarity creates <span className="text-emerald-400">possibility</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-neutral-300
                      text-[clamp(1rem,0.6vw+0.75rem,1.125rem)] leading-relaxed">
          BanyanAI turns instinct into structure — helping founders articulate
          their vision, align their team, and move faster with purpose.
        </p>
      </div>

      {/* Subtle divider animation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        className="mt-10 h-px w-24 bg-neutral-800"
      />
    </section>
  );
}

