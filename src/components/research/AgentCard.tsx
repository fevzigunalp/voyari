"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Loader2, RefreshCw } from "lucide-react";
import type { ResearchAgentId } from "@/lib/types/research";

/**
 * Extended, UI-facing status model. Superset of the shared ResearchStatus —
 * captures transient retry/fallback phases and splits the old "error" terminal
 * into "partial" (recoverable — safe stub, will retry) and "failed" (terminal
 * after delayed retry also failed).
 */
export type UiAgentStatus =
  | "idle"
  | "running"
  | "retrying"
  | "fallback_running"
  | "done"
  | "partial"
  | "failed";

export interface AgentCardProps {
  id: ResearchAgentId;
  icon: string;
  label: string;
  status: UiAgentStatus;
  snippets: string[];
  error?: string;
  /** Called when the user clicks the "Yeniden Dene" button (only for partial). */
  onManualRetry?: () => void;
  /** True while a manual retry request is in-flight. */
  retryInFlight?: boolean;
}

const STATUS_STYLES: Record<UiAgentStatus, string> = {
  idle: "border-white/[0.05] bg-white/[0.02] opacity-70",
  running:
    "border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]",
  retrying:
    "border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-cyan-500/5 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  fallback_running:
    "border-violet-400/40 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 shadow-[0_0_30px_rgba(139,92,246,0.15)]",
  done: "border-emerald-400/40 bg-emerald-500/5",
  partial: "border-amber-400/40 bg-amber-500/5",
  failed: "border-rose-400/40 bg-rose-500/5",
};

const STATUS_COPY: Record<UiAgentStatus, string> = {
  idle: "Bekleniyor…",
  running: "Araştırma başlıyor...",
  retrying: "Yeniden deneniyor...",
  fallback_running: "Yedek sağlayıcı deneniyor...",
  done: "Tamamlandı",
  partial: "Kısmi sonuç — arka planda tekrar denenecek",
  failed: "Başarısız — varsayılan kullanılıyor",
};

export function AgentCard({
  icon,
  label,
  status,
  snippets,
  error,
  onManualRetry,
  retryInFlight,
}: AgentCardProps) {
  const lastSnippet = snippets[snippets.length - 1] ?? STATUS_COPY[status];
  const isTransient =
    status === "running" ||
    status === "retrying" ||
    status === "fallback_running";
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
          {isTransient && (
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
              {status === "failed" && error ? (
                <motion.span
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-300"
                >
                  {STATUS_COPY.failed}
                </motion.span>
              ) : status === "partial" ? (
                <motion.span
                  key="partial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-amber-200"
                >
                  {STATUS_COPY.partial}
                </motion.span>
              ) : (
                <motion.span
                  key={lastSnippet}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  {lastSnippet}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {status === "partial" && onManualRetry && (
            <button
              type="button"
              onClick={onManualRetry}
              disabled={retryInFlight}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3 w-3 ${retryInFlight ? "animate-spin" : ""}`}
              />
              {retryInFlight ? "Deneniyor..." : "Yeniden Dene"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: UiAgentStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-cyan-300">
        <Loader2 className="h-3 w-3 animate-spin" /> çalışıyor
      </span>
    );
  }
  if (status === "retrying") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
        <Loader2 className="h-3 w-3 animate-spin" /> yeniden
      </span>
    );
  }
  if (status === "fallback_running") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-violet-300">
        <Loader2 className="h-3 w-3 animate-spin" /> yedek
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
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300">
        <AlertTriangle className="h-3 w-3" /> kısmi
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-rose-300">
        <AlertTriangle className="h-3 w-3" /> başarısız
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
      sırada
    </span>
  );
}
