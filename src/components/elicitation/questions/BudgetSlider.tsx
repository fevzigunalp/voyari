"use client";

import { useEffect, useMemo } from "react";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/utils/cn";
import type { BudgetLevel } from "@/lib/types/traveler-profile";
import type { BudgetValue, QuestionComponentProps } from "./types";

const LEVELS: {
  id: BudgetLevel;
  label: string;
  tagline: string;
  defaultDaily: number;
}[] = [
  { id: "budget", label: "Ekonomik", tagline: "Sırt çantası dostu", defaultDaily: 60 },
  { id: "moderate", label: "Orta", tagline: "Konfor + tasarruf", defaultDaily: 110 },
  { id: "comfortable", label: "Konforlu", tagline: "Boutique dokunuşlar", defaultDaily: 200 },
  { id: "luxury", label: "Lüks", tagline: "Premium hizmet", defaultDaily: 400 },
  { id: "unlimited", label: "Limitsiz", tagline: "Sky is the limit", defaultDaily: 800 },
];

export function BudgetSlider({
  value,
  onChange,
}: QuestionComponentProps<BudgetValue>) {
  const initialIndex = useMemo(() => {
    if (!value) return 1;
    const i = LEVELS.findIndex((l) => l.id === value.level);
    return i >= 0 ? i : 1;
  }, [value]);

  useEffect(() => {
    if (!value) {
      const lvl = LEVELS[initialIndex];
      onChange({
        level: lvl.id,
        dailyPerPerson: lvl.defaultDaily,
        currency: "EUR",
      });
    }
  }, [value, initialIndex, onChange]);

  const idx = value
    ? Math.max(
        0,
        LEVELS.findIndex((l) => l.id === value.level),
      )
    : initialIndex;

  const handleSlide = (n: number) => {
    const lvl = LEVELS[n];
    onChange({
      level: lvl.id,
      dailyPerPerson: value?.dailyPerPerson ?? lvl.defaultDaily,
      currency: value?.currency ?? "EUR",
    });
  };

  const handleDaily = (n: number) => {
    if (!value) return;
    onChange({ ...value, dailyPerPerson: Number.isFinite(n) ? n : undefined });
  };

  const current = LEVELS[idx];

  return (
    <div className="space-y-8">
      <Slider
        min={0}
        max={LEVELS.length - 1}
        step={1}
        value={idx}
        onChange={handleSlide}
        label="Bütçe Seviyesi"
        suffix={current.label}
      />

      <div className="grid grid-cols-5 gap-1.5">
        {LEVELS.map((lvl, i) => (
          <button
            type="button"
            key={lvl.id}
            onClick={() => handleSlide(i)}
            className={cn(
              "rounded-xl px-2 py-3 text-center transition-all",
              i === idx
                ? "bg-[rgba(212,168,83,0.12)] border border-[rgba(212,168,83,0.5)] shadow-[0_0_24px_rgba(212,168,83,0.2)]"
                : "bg-white/[0.03] border border-white/[0.06] hover:border-[rgba(212,168,83,0.25)]",
            )}
          >
            <div
              className={cn(
                "text-xs font-semibold mb-1",
                i === idx ? "text-[#E8C97A]" : "text-text-secondary",
              )}
            >
              {lvl.label}
            </div>
            <div className="text-[10px] text-text-muted leading-tight">
              {lvl.tagline}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
        <label className="block text-xs uppercase tracking-[0.22em] text-text-muted font-mono mb-2">
          Günlük / Kişi (€) — opsiyonel
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            value={value?.dailyPerPerson ?? ""}
            onChange={(e) => handleDaily(Number(e.target.value))}
            placeholder={current.defaultDaily.toString()}
            className="flex-1 bg-transparent text-2xl font-display text-[#E8C97A] outline-none"
          />
          <span className="text-text-muted">€</span>
        </div>
      </div>
    </div>
  );
}
