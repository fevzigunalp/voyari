"use client";

import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import type { FoodStyle } from "@/lib/types/traveler-profile";
import type { FoodValue, QuestionComponentProps } from "./types";

const STYLES: { id: FoodStyle; label: string; icon: string; description: string }[] = [
  { id: "local_explorer", label: "Yerel Kaşif", icon: "🍜", description: "Sokak lezzetleri ve ev yemekleri" },
  { id: "familiar", label: "Tanıdık Lezzet", icon: "🍝", description: "Bildiğim mutfaklar, güvenli seçimler" },
  { id: "self_cooking", label: "Kendim Pişiririm", icon: "🍳", description: "Apartman/karavanda kendi mutfağım" },
  { id: "mixed", label: "Karma", icon: "🍷", description: "Hem deneme hem konfor" },
];

const RESTRICTIONS = [
  "Vejetaryen",
  "Vegan",
  "Glutensiz",
  "Laktozsuz",
  "Helal",
  "Pesketaryen",
  "Düşük karbonhidrat",
  "Alerjisi var",
];

export function FoodPreference({
  value,
  onChange,
}: QuestionComponentProps<FoodValue>) {
  const v = value ?? { style: "mixed" as FoodStyle, restrictions: [] };

  const toggleR = (r: string) => {
    const next = v.restrictions.includes(r)
      ? v.restrictions.filter((x) => x !== r)
      : [...v.restrictions, r];
    onChange({ ...v, restrictions: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        {STYLES.map((s) => {
          const sel = v.style === s.id;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => onChange({ ...v, style: s.id })}
              className={cn(
                "rounded-2xl p-4 text-left border transition-colors",
                sel
                  ? "bg-[linear-gradient(160deg,rgba(212,168,83,0.18),rgba(26,31,53,0.95))] border-[rgba(212,168,83,0.7)] shadow-[0_0_24px_rgba(212,168,83,0.25)]"
                  : "bg-white/[0.03] border-white/[0.06] hover:border-[rgba(212,168,83,0.3)]",
              )}
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div
                className={cn(
                  "font-display text-base",
                  sel ? "text-[#E8C97A]" : "text-text-primary",
                )}
              >
                {s.label}
              </div>
              <div className="text-xs text-text-muted mt-1">{s.description}</div>
            </button>
          );
        })}
      </div>

      <div>
        <div className="text-xs text-text-muted uppercase tracking-[0.2em] font-mono mb-3">
          Diyet kısıtları
        </div>
        <div className="flex flex-wrap gap-2">
          {RESTRICTIONS.map((r) => (
            <Chip
              key={r}
              label={r}
              selected={v.restrictions.includes(r)}
              onClick={() => toggleR(r)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
