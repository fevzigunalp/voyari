"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  label,
  className,
}: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);
  const percent = (safeCurrent / safeTotal) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-[0.22em] text-text-muted font-mono">
          {label ?? "İlerleme"}
        </span>
        <span className="text-xs font-mono text-[#E8C97A]">
          {safeCurrent}/{safeTotal} Adım
        </span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[linear-gradient(90deg,#D4A853,#F59E0B)]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <motion.div
          className="absolute top-0 h-full w-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]"
          initial={{ left: "-10%" }}
          animate={{ left: `${Math.max(percent - 10, 0)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
    </div>
  );
}
