"use client";

import { Chip } from "@/components/ui/Chip";
import type { QuestionComponentProps } from "./types";

const INTERESTS = [
  "tarih",
  "müze",
  "yemek",
  "gastronomi",
  "doğa",
  "macera",
  "spa",
  "wellness",
  "fotoğraf",
  "plaj",
  "deniz",
  "şehir",
  "alışveriş",
  "gece hayatı",
  "müzik",
  "sanat",
  "mimari",
  "sokak lezzetleri",
  "yerel pazar",
  "şarap & bağ",
];

export function InterestCloud({
  value,
  onChange,
}: QuestionComponentProps<string[]>) {
  const selected = value ?? [];
  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((i) => (
          <Chip
            key={i}
            label={i}
            selected={selected.includes(i)}
            onClick={() => toggle(i)}
          />
        ))}
      </div>
      <div className="text-xs text-text-muted mt-4 font-mono uppercase tracking-[0.2em]">
        {selected.length} seçildi · en az 3 öneririz
      </div>
    </div>
  );
}
