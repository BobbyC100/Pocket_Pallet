"use client";

import { motion } from "framer-motion";

export default function IntroHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-8 max-w-3xl text-center"
    >
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-neutral-950/40 px-8 py-10 backdrop-blur-sm">
        <h1 className="text-2xl font-medium tracking-tight text-white">
          Turn vision into <span className="text-emerald-400">structure.</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          BanyanAI helps founders translate intent into clarity.  
          Define your vision, build your framework, and surface the next steps that move ideas into action.
        </p>
      </div>
    </motion.section>
  );
}

