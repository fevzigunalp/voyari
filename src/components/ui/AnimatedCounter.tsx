"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  prefix,
  suffix,
  className,
}: AnimatedCounterProps) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) => {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(latest * factor) / factor;
    return `${prefix ?? ""}${rounded.toLocaleString("tr-TR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix ?? ""}`;
  });

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [value, duration, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
