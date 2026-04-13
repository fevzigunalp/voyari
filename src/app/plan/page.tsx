"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ElicitationEngine } from "@/components/elicitation";
import { ResearchDashboard } from "@/components/research";
import { useTravelStore } from "@/lib/store/travel-store";
import type { TravelerProfile } from "@/lib/types/traveler-profile";

type Phase = "elicitation" | "research";

export default function PlanPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("elicitation");
  const profile = useTravelStore((s) => s.profile);

  const handleElicitationComplete = useCallback(() => {
    setPhase("research");
  }, []);

  const handleResearchComplete = useCallback(() => {
    router.push("/result/preview");
  }, [router]);

  return (
    <>
      <Header />
      <main className="flex-1">
        {phase === "elicitation" && (
          <ElicitationEngine onComplete={handleElicitationComplete} />
        )}
        {phase === "research" && (
          <ResearchDashboard
            profile={profile as TravelerProfile}
            onComplete={handleResearchComplete}
          />
        )}
      </main>
    </>
  );
}
