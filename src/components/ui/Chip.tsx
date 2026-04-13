"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({
  label,
  icon,
  selected = false,
  disabled = false,
  onClick,
  className,
}: ChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { y: -1 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 px-4 h-9 rounded-full border text-sm font-medium",
        "transition-colors select-none",
        selected
          ? "bg-[rgba(212,168,83,0.15)] text-[#E8C97A] border-[rgba(212,168,83,0.6)] shadow-[0_0_0_3px_rgba(212,168,83,0.1)]"
          : "bg-white/[0.03] text-text-secondary border-white/[0.08] hover:text-text-primary hover:border-[rgba(212,168,83,0.3)]",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  );
}
