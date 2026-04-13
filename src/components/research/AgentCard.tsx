"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import type { ResearchAgentId, ResearchStatus } from "@/lib/types/research";

export interface AgentCardProps {
  id: ResearchAgentId;
  icon: string;
  label: string;
  status: ResearchStatus;
  snippets: string[];
  error?: string;
}

const STATUS_STYLES: Record<ResearchStatus, string> = {
  idle: "border-white/[0.05] bg-white/[0.02] opacity-70",
  running:
    "border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]",
  done: "border-emerald-400/40 bg-emerald-500/5",
  error: "border-rose-400/40 bg-rose-500/5",
};

export function AgentCard({
  icon,
  label,
  status,
  snippets,
  error,
}: AgentCardProps) {
  const lastSnippet = snippets[snippets.length - 1];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-4 backdrop-blur-xl transition-colors ${STATUS_STYLES[status]}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[0.04] text-2xl">
          <span>{icon}</span>
          {status === "running" && (
            <motion.span
              className="absolute inset-0 rounded-xl border-2 border-cyan-300/60"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-medium text-white">{label}</h4>
            <StatusBadge status={status} />
          </div>

          <div className="mt-1.5 min-h-[18px] text-[12px] text-text-muted">
            <AnimatePresence mode="wait">
              {status === "error" && error ? (
                <motion.span
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-300"
                >
                  {error}
                </motion.span>
              ) : lastSnippet ? (
                <motion.span
                  key={lastSnippet}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  {lastSnippet}
                </motion.span>
              ) : (
                <span className="opacity-60">Bekleniyor…</span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: ResearchStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyan-300">
        <Loader2 className="h-3 w-3 animate-spin" /> çalışıyor
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
        <Check className="h-3 w-3" /> bitti
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-rose-300">
        <AlertTriangle className="h-3 w-3" /> hata
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
      sırada
    </span>
  );
}
