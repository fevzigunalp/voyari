"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "glass" | "elevated" | "gold";

export interface CardProps
  extends Omit<HTMLMotionProps<"div">, "ref" | "children"> {
  variant?: CardVariant;
  interactive?: boolean;
  padded?: boolean;
  children?: React.ReactNode;
}

const variantClass: Record<CardVariant, string> = {
  default:
    "bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]",
  glass: "glass",
  elevated:
    "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]",
  gold:
    "bg-[linear-gradient(180deg,rgba(212,168,83,0.12)_0%,rgba(26,31,53,0.95)_100%)] " +
    "border border-[rgba(212,168,83,0.35)] shadow-[0_10px_40px_-10px_rgba(212,168,83,0.3)]",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "default",
    interactive = false,
    padded = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      whileHover={interactive ? { y: -3, scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "rounded-2xl relative",
        padded ? "p-6" : "",
        interactive ? "cursor-pointer transition-colors hover:border-[rgba(212,168,83,0.35)]" : "",
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export function CardHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div className="min-w-0">
        <h3 className="font-display text-xl text-text-primary tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
