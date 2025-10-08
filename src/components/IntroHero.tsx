"use client";

import { motion } from "framer-motion";

export default function IntroHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto mb-8 max-w-3xl text-center"
    >
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-neutral-950/40 px-8 py-10 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Turn vision into <span className="text-emerald-400">clarity</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-neutral-300">
          BanyanAI helps founders express what matters most — then builds a strategic
          brief to make it real.
        </p>
      </div>
      
      {/* Gentle handoff to the wizard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="mx-auto mt-6 h-px w-24 bg-neutral-800"
      />
    </motion.section>
  );
}

