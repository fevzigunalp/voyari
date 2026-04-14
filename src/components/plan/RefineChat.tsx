"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import type { TravelPlan } from "@/lib/types/plan";
import { usePlanStore } from "@/lib/store/plan-store";
import { cn } from "@/lib/utils/cn";

const QUICK_PROMPTS = [
  "Tempoyu yavaşlat",
  "Daha az restoran, daha çok doğa",
  "3. günü değiştir",
  "Bütçeyi düşür",
];

export interface RefineChatProps {
  plan: TravelPlan;
}

export function RefineChat({ plan }: RefineChatProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savePlan = usePlanStore((s) => s.savePlan);

  async function submit(text: string) {
    const refinement = text.trim();
    if (!refinement || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refine-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          plan,
          refinement,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Revizyon başarısız");
      }
      const data = (await res.json()) as { plan: TravelPlan };
      if (!data?.plan) throw new Error("Boş yanıt");
      savePlan({ ...data.plan, id: plan.id });
      setValue("");
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-8 md:right-8">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-[rgba(212,168,83,0.35)] bg-[rgba(10,14,26,0.96)] p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E8C97A]">
                  <Sparkles className="h-3 w-3" />
                  Concierge
                </div>
                <h3 className="mt-1 font-display text-lg text-text-primary">
                  Planınızı yeniden şekillendirin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-text-muted hover:bg-white/5 hover:text-text-primary"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => submit(q)}
                  className="rounded-full border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.6)] px-3 py-1 text-xs text-text-secondary hover:border-[rgba(212,168,83,0.4)] hover:text-[#E8C97A] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit(value);
              }}
              className="mt-3"
            >
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={loading}
                rows={3}
                placeholder="Ne değiştirelim? Örn. 2. günde daha az şehir, daha fazla sahil."
                className="w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.6)] p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-[rgba(212,168,83,0.4)] focus:outline-none disabled:opacity-50"
              />
              {error && (
                <div className="mt-2 text-xs text-red-400">{error}</div>
              )}
              {loading && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[#E8C97A]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Planınızı yeniden örüyoruz...
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !value.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#E8C97A_0%,#D4A853_50%,#F59E0B_100%)] px-4 py-2 text-sm font-medium text-[#0A0E1A] shadow-[0_8px_24px_-8px_rgba(212,168,83,0.5)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Gönder
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[#0A0E1A]",
          "bg-[linear-gradient(135deg,#E8C97A_0%,#D4A853_50%,#F59E0B_100%)]",
          "shadow-[0_16px_40px_-12px_rgba(212,168,83,0.6)] transition",
        )}
        aria-label="Planı düzenle"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {open ? "Kapat" : "Düzenle"}
      </motion.button>
    </div>
  );
}
