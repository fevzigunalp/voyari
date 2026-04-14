"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import type {
  ChecklistItem,
  ReservationItem,
  TravelPlan,
} from "@/lib/types/plan";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

type TabKey = "packing" | "vehicle" | "documents" | "reservations";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "packing", label: "Bavul" },
  { key: "vehicle", label: "Araç" },
  { key: "documents", label: "Belgeler" },
  { key: "reservations", label: "Rezervasyonlar" },
];

export interface ChecklistPanelProps {
  plan: TravelPlan;
}

export function ChecklistPanel({ plan }: ChecklistPanelProps) {
  const [active, setActive] = useState<TabKey>("packing");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const lists = useMemo(
    () => ({
      packing: plan.logistics?.packingList ?? [],
      vehicle: plan.logistics?.vehicleChecklist ?? [],
      documents: plan.logistics?.documentChecklist ?? [],
    }),
    [plan],
  );
  const reservations: ReservationItem[] =
    plan.logistics?.reservationTimeline ?? [];

  const toggle = (id: string) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  const current =
    active === "reservations"
      ? null
      : (lists[active as Exclude<TabKey, "reservations">] as ChecklistItem[]);

  const completion = current
    ? current.length === 0
      ? 0
      : Math.round(
          (current.filter((it) => done[it.id] ?? it.done).length /
            current.length) *
            100,
        )
    : 0;

  return (
    <Card variant="default">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h3 className="font-display text-lg text-text-primary">Kontrol Listeleri</h3>
        {active !== "reservations" && current && current.length > 0 && (
          <div className="text-xs text-text-muted font-mono">
            Tamamlanan: {completion}%
          </div>
        )}
      </div>

      <div className="flex gap-1 flex-wrap border-b border-[var(--border-subtle)] mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "px-3 py-2 text-sm font-mono uppercase tracking-wider transition-colors",
              active === t.key
                ? "text-[#E8C97A] border-b-2 border-[#E8C97A]"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "reservations" ? (
        reservations.length === 0 ? (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] p-3 text-sm text-text-secondary">
            Rezervasyon takvimi henüz hazırlanıyor — bu sırada otel ve ulaşım için 3 hafta önceden planlama yapmanız önerilir.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reservations.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] p-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="font-display text-sm text-text-primary">
                    {r.title}
                  </div>
                  <div className="font-mono text-[10px] text-[#E8C97A]">
                    {r.dueDate}
                  </div>
                </div>
                {r.notes && (
                  <p className="text-xs text-text-secondary mt-1">{r.notes}</p>
                )}
              </motion.div>
            ))}
          </div>
        )
      ) : current && current.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {current.map((it) => {
            const isDone = done[it.id] ?? it.done;
            return (
              <button
                key={it.id}
                onClick={() => toggle(it.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                  isDone
                    ? "border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)]"
                    : "border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] hover:border-[rgba(212,168,83,0.3)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                    isDone
                      ? "border-emerald-400 bg-emerald-400/20"
                      : "border-[var(--border-subtle)]",
                  )}
                >
                  {isDone && <Check className="h-3 w-3 text-emerald-300" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-sm",
                      isDone
                        ? "text-text-muted line-through"
                        : "text-text-primary",
                    )}
                  >
                    {it.label}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    {it.category}
                    {it.essential ? " · zorunlu" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] p-3 text-sm text-text-secondary">
          Bu sezonun önerilen listesi hazırlanıyor — pasaport, kredi kartı, şarj adaptörü ve konforlu ayakkabı her zaman temel.
        </div>
      )}
    </Card>
  );
}
