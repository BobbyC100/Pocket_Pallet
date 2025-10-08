"use client";
import { motion } from "framer-motion";

export default function IntroHero() {
  return (
    <section className="mx-auto mb-16 max-w-5xl px-4 text-left">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-semibold tracking-tight text-white
                       text-[clamp(2.25rem,3.8vw+0.5rem,3.5rem)] leading-tight">
          Create internal systems that <span className="text-emerald-400">align and empower</span>.
        </h1>
        <p className="mt-5 max-w-3xl text-neutral-300
                      text-[clamp(1rem,0.6vw+0.75rem,1.125rem)] leading-relaxed">
          BanyanAI turns instinct into structure — helping founders articulate their vision,
          align their team, and move faster with purpose.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "6rem" }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        className="mt-10 h-px bg-neutral-800"
      />
    </section>
  );
}

