"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Gem } from "lucide-react";
import type { PlanNarrative as PlanNarrativeType } from "@/lib/types/plan";

export interface PlanNarrativeProps {
  narrative: PlanNarrativeType;
}

export function PlanNarrative({ narrative }: PlanNarrativeProps) {
  const why = narrative.whyPerfectForYou ?? [];
  const unique = narrative.whatMakesUnique ?? [];
  const signature = narrative.signatureMoments ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-[rgba(212,168,83,0.25)] bg-[linear-gradient(135deg,rgba(26,31,53,0.85)_0%,rgba(17,24,39,0.75)_100%)] p-6 md:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(232,201,122,0.18)_0%,transparent_70%)]"
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,168,83,0.35)] bg-[rgba(10,14,26,0.5)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E8C97A]">
          <Sparkles className="h-3 w-3" />
          İlk Bakışta
        </div>

        {narrative.glanceTitle && (
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mt-4 text-gradient-gold"
          >
            {narrative.glanceTitle}
          </motion.h1>
        )}

        {narrative.emotionalSummary && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-5 max-w-3xl font-display text-lg md:text-xl leading-relaxed text-text-secondary italic"
          >
            {narrative.emotionalSummary}
          </motion.p>
        )}

        {(why.length > 0 || unique.length > 0) && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {why.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(10,14,26,0.45)] p-5"
              >
                <div className="flex items-center gap-2 text-[#E8C97A]">
                  <Heart className="h-4 w-4" />
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em]">
                    Size neden mükemmel
                  </h3>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {why.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#E8C97A]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {unique.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(10,14,26,0.45)] p-5"
              >
                <div className="flex items-center gap-2 text-[#E8C97A]">
                  <Gem className="h-4 w-4" />
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em]">
                    Bu planı özel kılan
                  </h3>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {unique.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#E8C97A]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        )}

        {signature.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {signature.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,168,83,0.25)] bg-[rgba(10,14,26,0.4)] px-3 py-1.5 text-xs text-text-secondary"
              >
                <Sparkles className="h-3 w-3 text-[#E8C97A]" />
                {s}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
