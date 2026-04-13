"use client";

import { Route as RouteIcon, CloudRain } from "lucide-react";
import type { AlternativeRoute } from "@/lib/types/plan";
import { Card } from "@/components/ui/Card";

export interface AlternativePlanProps {
  alternatives?: AlternativeRoute[];
  rainSummary?: string;
}

export function AlternativePlan({
  alternatives,
  rainSummary,
}: AlternativePlanProps) {
  const alts = alternatives ?? [];
  if (alts.length === 0 && !rainSummary) return null;

  return (
    <Card variant="default">
      <h3 className="font-display text-lg text-text-primary mb-3">
        Alternatif Planlar
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        {alts.map((a, i) => (
          <div
            key={`${a.label}-${i}`}
            className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <RouteIcon className="h-4 w-4 text-[#E8C97A]" />
              <div className="font-display text-base text-text-primary">
                {a.label}
              </div>
            </div>
            <p className="text-xs text-text-secondary">{a.description}</p>
            <div className="mt-2 text-[11px] font-mono text-text-muted">
              {a.distanceKm.toLocaleString("tr-TR")} km ·{" "}
              {a.durationHours} sa
            </div>
          </div>
        ))}
        {rainSummary && (
          <div className="rounded-xl border border-sky-400/30 bg-sky-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CloudRain className="h-4 w-4 text-sky-400" />
              <div className="font-display text-base text-text-primary">
                Yağmur Senaryosu
              </div>
            </div>
            <p className="text-xs text-text-secondary">{rainSummary}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
