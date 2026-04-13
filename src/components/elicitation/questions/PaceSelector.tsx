"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { PaceType } from "@/lib/types/traveler-profile";
import type { PaceValue, QuestionComponentProps } from "./types";

const OPTIONS: { id: PaceType; label: string; icon: string; description: string }[] = [
  { id: "packed", label: "Dolu Dolu", icon: "⚡", description: "Sabah erken kalk, her gün maksimum keşif" },
  { id: "balanced", label: "Dengeli", icon: "🎯", description: "Aktiviteler ve dinlenme harmanlı" },
  { id: "relaxed", label: "Sakin", icon: "🌿", description: "Geç başla, az ama nitelikli aktivite" },
];

export function PaceSelector({
  value,
  onChange,
}: QuestionComponentProps<PaceValue>) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {OPTIONS.map((o) => {
        const sel = value?.pace === o.id;
        return (
          <motion.button
            type="button"
            key={o.id}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange({ pace: o.id })}
            className={cn(
              "rounded-2xl p-5 text-left border transition-colors",
              sel
                ? "bg-[linear-gradient(160deg,rgba(212,168,83,0.18),rgba(26,31,53,0.95))] border-[rgba(212,168,83,0.7)] shadow-[0_0_30px_rgba(212,168,83,0.3)] scale-[1.02]"
                : "bg-white/[0.03] border-white/[0.06] hover:border-[rgba(212,168,83,0.3)]",
            )}
          >
            <div className="text-3xl mb-3">{o.icon}</div>
            <div
              className={cn(
                "font-display text-lg",
                sel ? "text-[#E8C97A]" : "text-text-primary",
              )}
            >
              {o.label}
            </div>
            <div className="text-xs text-text-muted mt-1 leading-snug">
              {o.description}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
