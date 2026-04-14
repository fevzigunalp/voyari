"use client";

import { motion } from "framer-motion";
import { PenLine, ListChecks, Sparkles } from "lucide-react";

export type EntryMode = "choose" | "dream" | "structured";

interface EntryChooserProps {
  onSelect: (mode: Exclude<EntryMode, "choose">) => void;
}

export function EntryChooser({ onSelect }: EntryChooserProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[rgba(212,168,83,0.85)]">
          <Sparkles className="h-3.5 w-3.5" /> Voyari Concierge
        </div>
        <h1 className="font-display text-3xl sm:text-4xl mt-4 text-gradient-gold">
          Nasıl başlamak istersiniz?
        </h1>
        <p className="mt-3 text-sm sm:text-base text-text-secondary">
          Seyahat deneyiminizi birlikte tasarlayalım.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2">
        <motion.button
          type="button"
          onClick={() => onSelect("dream")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl border border-[rgba(212,168,83,0.25)] bg-gradient-to-br from-[rgba(26,31,53,0.8)] to-[rgba(10,14,26,0.9)] p-8 text-left backdrop-blur-xl transition-colors hover:border-[rgba(212,168,83,0.55)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,168,83,0.18),transparent_60%)] opacity-80 pointer-events-none" />
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(212,168,83,0.4)] bg-[rgba(212,168,83,0.08)] text-[rgba(232,201,122,1)]">
              <PenLine className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl mt-5 text-text-primary">
              Hayalinizi anlatın
            </h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Birkaç cümleyle anlatın, biz kurguyu yapalım.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[rgba(212,168,83,0.9)] group-hover:text-[rgba(232,201,122,1)]">
              Başla →
            </div>
          </div>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => onSelect("structured")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[rgba(26,31,53,0.6)] to-[rgba(10,14,26,0.85)] p-8 text-left backdrop-blur-xl transition-colors hover:border-white/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(120,150,220,0.12),transparent_60%)] opacity-80 pointer-events-none" />
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] text-text-primary">
              <ListChecks className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl mt-5 text-text-primary">
              Adım adım planlayalım
            </h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Rehberli sorularla detaylandıralım.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-text-secondary group-hover:text-text-primary">
              Başla →
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
