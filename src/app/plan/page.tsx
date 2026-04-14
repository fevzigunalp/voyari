"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ElicitationEngine } from "@/components/elicitation";
import { EntryChooser, type EntryMode } from "@/components/elicitation/EntryChooser";
import { DreamInput } from "@/components/elicitation/DreamInput";
import { ResearchDashboard } from "@/components/research";
import { useTravelStore, type ResearchBundle } from "@/lib/store/travel-store";
import { usePlanStore } from "@/lib/store/plan-store";
import { useElicitationStore } from "@/lib/store/elicitation-store";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { TravelPlan } from "@/lib/types/plan";
import type { ExtractedIntent } from "@/lib/ai/schema";

type Phase = "elicitation" | "research" | "generating" | "error";

export default function PlanPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("elicitation");
  const [entryMode, setEntryMode] = useState<EntryMode>("choose");
  const [error, setError] = useState<string | null>(null);
  const profile = useTravelStore((s) => s.profile);
  const savePlan = usePlanStore((s) => s.savePlan);
  const hydrateFromIntent = useElicitationStore((s) => s.hydrateFromIntent);

  const handleElicitationComplete = useCallback(() => {
    setPhase("research");
  }, []);

  const handleIntentExtracted = useCallback(
    (intent: ExtractedIntent) => {
      hydrateFromIntent(intent);
      setEntryMode("structured");
    },
    [hydrateFromIntent],
  );

  const handleResearchComplete = useCallback(
    async (research: ResearchBundle) => {
      setPhase("generating");
      try {
        const res = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile, research }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const reason = typeof body?.reason === "string" ? body.reason : "";
          const friendly =
            reason === "rate_limited"
              ? "Sistem şu an yoğun. Birkaç saniye sonra tekrar deneyin."
              : reason === "timeout"
                ? "AI sağlayıcısı geç cevap verdi. Tekrar deneyebilirsiniz."
                : reason === "provider_exhausted"
                  ? "AI sağlayıcıları geçici olarak kullanılamıyor. Lütfen biraz sonra tekrar deneyin."
                  : body?.error || `Sunucu hatası (${res.status})`;
          throw new Error(friendly);
        }
        const data = (await res.json()) as { plan: TravelPlan };
        if (!data?.plan?.id) throw new Error("Plan oluşturulamadı");
        savePlan(data.plan);
        router.push(`/result/${data.plan.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        setError(msg);
        setPhase("error");
      }
    },
    [profile, router, savePlan],
  );

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
        {phase === "research" && (
          <ResearchDashboard
            profile={profile as TravelerProfile}
            onComplete={handleResearchComplete}
          />
        )}
        {phase === "generating" && (
          <div className="mx-auto max-w-2xl px-4 py-24 text-center">
            <div className="inline-block animate-glow-pulse rounded-2xl border border-[rgba(212,168,83,0.4)] bg-[rgba(26,31,53,0.6)] px-8 py-10">
              <div className="text-5xl animate-float">✨</div>
              <h2 className="font-display text-2xl mt-4 text-gradient-gold">
                Plan Hazırlanıyor
              </h2>
              <p className="text-sm text-text-secondary mt-2">
                Araştırma sonuçları nihai rota, bütçe ve önerilere
                dönüştürülüyor. Bu birkaç dakika sürebilir.
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
                onClick={() => setPhase("research")}
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
