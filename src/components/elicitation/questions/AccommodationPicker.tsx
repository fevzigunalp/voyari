"use client";

import { motion } from "framer-motion";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import type { AccommodationType } from "@/lib/types/traveler-profile";
import type {
  AccommodationValue,
  QuestionComponentProps,
} from "./types";

interface Option {
  id: AccommodationType;
  label: string;
  icon: string;
  description: string;
  priceBand: number; // 1-5 €
}

const OPTIONS: Option[] = [
  { id: "luxury", label: "Ultra Lüks", icon: "💎", description: "5★+ resort, butler, suit", priceBand: 5 },
  { id: "5star", label: "5 Yıldız", icon: "🏨", description: "Tam donanım klasik lüks", priceBand: 4 },
  { id: "4star", label: "4 Yıldız", icon: "🛎️", description: "Konforlu ana akım", priceBand: 3 },
  { id: "boutique", label: "Boutique", icon: "🏛️", description: "Karakterli, küçük ölçek", priceBand: 3 },
  { id: "airbnb", label: "Airbnb / Daire", icon: "🏠", description: "Yerel hisle ev konforu", priceBand: 2 },
  { id: "hostel", label: "Hostel", icon: "🛏️", description: "Ekonomik & sosyal", priceBand: 1 },
  { id: "camping", label: "Kamp", icon: "⛺", description: "Doğa ile iç içe", priceBand: 1 },
  { id: "mixed", label: "Karma", icon: "🔀", description: "Şehre göre değişken", priceBand: 3 },
];

const PRIORITIES = [
  "Havuz",
  "Plaj erişimi",
  "Spa",
  "Aile odası",
  "Ücretsiz park",
  "Şehir merkezinde",
  "Kahvaltı dahil",
  "Pet friendly",
  "Çalışma alanı",
  "Spor salonu",
];

export function AccommodationPicker({
  value,
  onChange,
}: QuestionComponentProps<AccommodationValue>) {
  const selected = value?.type;
  const priorities = value?.priorities ?? [];

  const togglePriority = (p: string) => {
    if (!value) return;
    const next = priorities.includes(p)
      ? priorities.filter((x) => x !== p)
      : [...priorities, p];
    onChange({ ...value, priorities: next });
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <div className="flex gap-3 min-w-min">
          {OPTIONS.map((o) => {
            const isSel = selected === o.id;
            return (
              <motion.button
                type="button"
                key={o.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  onChange({
                    type: o.id,
                    priorities: value?.priorities ?? [],
                  })
                }
                className={cn(
                  "shrink-0 w-44 rounded-2xl p-4 text-left border transition-colors",
                  isSel
                    ? "bg-[linear-gradient(160deg,rgba(212,168,83,0.18),rgba(26,31,53,0.95))] border-[rgba(212,168,83,0.7)] shadow-[0_0_32px_rgba(212,168,83,0.3)] scale-[1.03]"
                    : "bg-white/[0.03] border-white/[0.06] hover:border-[rgba(212,168,83,0.3)]",
                )}
              >
                <div className="text-3xl mb-2">{o.icon}</div>
                <div
                  className={cn(
                    "font-display text-base",
                    isSel ? "text-[#E8C97A]" : "text-text-primary",
                  )}
                >
                  {o.label}
                </div>
                <div className="text-[11px] text-text-muted mt-1 leading-snug">
                  {o.description}
                </div>
                <div className="mt-3 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-sm",
                        i < o.priceBand ? "text-[#E8C97A]" : "text-text-muted/40",
                      )}
                    >
                      €
                    </span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div>
          <div className="text-xs text-text-muted uppercase tracking-[0.2em] font-mono mb-3">
            Öncelikleriniz
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                label={p}
                selected={priorities.includes(p)}
                onClick={() => togglePriority(p)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
