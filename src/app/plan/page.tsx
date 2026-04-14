"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ElicitationEngine } from "@/components/elicitation";
import { EntryChooser, type EntryMode } from "@/components/elicitation/EntryChooser";
import { DreamInput } from "@/components/elicitation/DreamInput";
import { useTravelStore } from "@/lib/store/travel-store";
import { usePlanStore } from "@/lib/store/plan-store";
import { useElicitationStore } from "@/lib/store/elicitation-store";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { TravelPlan } from "@/lib/types/plan";
import type { ExtractedIntent } from "@/lib/ai/schema";

type Phase = "elicitation" | "generating" | "error";

interface CoreResponse {
  planId: string;
  plan: TravelPlan | null;
  partial?: boolean;
  timedOut?: boolean;
  error?: string;
}

export default function PlanPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("elicitation");
  const [entryMode, setEntryMode] = useState<EntryMode>("choose");
  const [error, setError] = useState<string | null>(null);
  const profile = useTravelStore((s) => s.profile);
  const savePlan = usePlanStore((s) => s.savePlan);
  const hydrateFromIntent = useElicitationStore((s) => s.hydrateFromIntent);

  const handleIntentExtracted = useCallback(
    (intent: ExtractedIntent) => {
      hydrateFromIntent(intent);
      setEntryMode("structured");
    },
    [hydrateFromIntent],
  );

  const handleElicitationComplete = useCallback(async () => {
    setPhase("generating");
    setError(null);
    try {
      const res = await fetch("/api/plan/core", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) {
        throw new Error("Plan iskeleti oluşturulamadı, tekrar deneyin.");
      }
      const data = (await res.json()) as CoreResponse;
      if (!data?.plan) {
        throw new Error("Plan iskeleti oluşturulamadı, tekrar deneyin.");
      }
      const plan = data.plan;
      if (!plan.id) plan.id = data.planId;
      savePlan(plan);
      router.push(`/result/${plan.id}?streaming=1`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      setError(raw || "Plan iskeleti oluşturulamadı, tekrar deneyin.");
      setPhase("error");
    }
  }, [profile, router, savePlan]);

  return (
    <>
      <Header />
      <main className="flex-1">
        {phase === "elicitation" && entryMode === "choose" && (
          <EntryChooser onSelect={(mode) => setEntryMode(mode)} />
        )}
        {phase === "elicitation" && entryMode === "dream" && (
          <DreamInput
            onBack={() => setEntryMode("choose")}
            onExtracted={handleIntentExtracted}
          />
        )}
        {phase === "elicitation" && entryMode === "structured" && (
          <ElicitationEngine onComplete={handleElicitationComplete} />
        )}
        {phase === "generating" && (
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <div className="inline-block animate-glow-pulse rounded-2xl border border-[rgba(212,168,83,0.4)] bg-[rgba(26,31,53,0.6)] px-8 py-10">
              <div className="text-5xl animate-float">✨</div>
              <h2 className="font-display text-2xl mt-4 text-gradient-gold">
                Plan iskeleti hazırlanıyor...
              </h2>
              <p className="text-sm text-text-secondary mt-2">
                Rota ve ana gün akışı birkaç saniye içinde hazır olacak. Ardından
                konaklama, restoran, aktivite, lojistik, bütçe ve hava detayları
                paralel olarak yüklenir.
              </p>
            </div>
          </div>
        )}
        {phase === "error" && (
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8">
              <h2 className="font-display text-2xl text-rose-200">
                Plan oluşturulamadı
              </h2>
              <p className="text-sm text-text-secondary mt-2">{error}</p>
              <button
                onClick={() => {
                  setPhase("elicitation");
                  setEntryMode("structured");
                }}
                className="mt-5 rounded-xl border border-[rgba(212,168,83,0.4)] px-5 py-2 text-sm text-text-primary hover:bg-white/5"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// Reference TravelerProfile for strict-mode import preservation.
export type _PlanProfileRef = TravelerProfile;
