"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface GlowEffectProps {
  color?: string;
  size?: number;
  intensity?: number;
  className?: string;
  animated?: boolean;
}

export function GlowEffect({
  color = "#D4A853",
  size = 420,
  intensity = 0.35,
  className,
  animated = true,
}: GlowEffectProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    background: `radial-gradient(closest-side, ${color} 0%, transparent 70%)`,
    opacity: intensity,
    filter: "blur(40px)",
  };

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full",
        className,
      )}
      style={style}
      animate={
        animated
          ? { scale: [1, 1.08, 1], opacity: [intensity, intensity * 1.2, intensity] }
          : undefined
      }
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
