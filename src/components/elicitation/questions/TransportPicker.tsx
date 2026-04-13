"use client";

import { motion } from "framer-motion";
import { TRANSPORT_LIST } from "@/lib/constants/transport-rules";
import { cn } from "@/lib/utils/cn";
import type { QuestionComponentProps, TransportValue } from "./types";

export function TransportPicker({
  value,
  onChange,
}: QuestionComponentProps<TransportValue>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {TRANSPORT_LIST.map((t) => {
        const selected = value?.type === t.type;
        return (
          <motion.button
            type="button"
            key={t.type}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            onClick={() => onChange({ type: t.type })}
            className={cn(
              "relative rounded-2xl p-4 sm:p-5 text-left border transition-colors",
              selected
                ? "bg-[linear-gradient(160deg,rgba(212,168,83,0.18),rgba(26,31,53,0.95))] border-[rgba(212,168,83,0.7)] shadow-[0_0_32px_rgba(212,168,83,0.32)] scale-[1.02]"
                : "bg-white/[0.03] border-white/[0.06] hover:border-[rgba(212,168,83,0.3)]",
            )}
          >
            <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">
              {t.icon}
            </div>
            <div
              className={cn(
                "font-display text-lg tracking-tight",
                selected ? "text-[#E8C97A]" : "text-text-primary",
              )}
            >
              {t.label}
            </div>
            <div className="text-xs text-text-muted mt-0.5">{t.tagline}</div>
          </motion.button>
        );
      })}
    </div>
  );
}
