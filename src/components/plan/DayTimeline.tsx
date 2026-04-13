"use client";

import { motion } from "framer-motion";
import type { DayPlan } from "@/lib/types/plan";
import { cn } from "@/lib/utils/cn";

export interface DayTimelineProps {
  days: DayPlan[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function DayTimeline({ days, activeIndex, onSelect }: DayTimelineProps) {
  return (
    <div className="md:sticky md:top-4 md:max-h-[75vh] md:overflow-y-auto md:pr-1">
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 snap-x md:snap-none">
        {days.map((day, i) => {
          const active = i === activeIndex;
          return (
            <motion.button
              key={`${day.dayNumber}-${i}`}
              whileHover={{ x: 2 }}
              onClick={() => onSelect(i)}
              className={cn(
                "text-left rounded-xl border px-4 py-3 transition-colors shrink-0 min-w-[220px] md:min-w-0 snap-start md:snap-align-none",
                active
                  ? "border-[rgba(212,168,83,0.55)] bg-[linear-gradient(180deg,rgba(212,168,83,0.18)_0%,rgba(26,31,53,0.95)_100%)] shadow-[0_8px_24px_-8px_rgba(212,168,83,0.4)]"
                  : "border-[var(--border-subtle)] bg-[rgba(17,24,39,0.6)] hover:border-[rgba(212,168,83,0.3)]",
              )}
            >
              <div
                className={cn(
                  "text-[10px] uppercase font-mono tracking-[0.2em]",
                  active ? "text-[#E8C97A]" : "text-text-muted",
                )}
              >
                Gün {day.dayNumber} · {day.date}
              </div>
              <div
                className={cn(
                  "font-display text-base mt-0.5 truncate",
                  active ? "text-[#E8C97A]" : "text-text-primary",
                )}
              >
                {day.title}
              </div>
              <div className="text-xs text-text-secondary mt-1 truncate">
                {day.city}
                {day.country ? `, ${day.country}` : ""}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
