"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface QuestionCardProps {
  title: string;
  subtitle?: string;
  required?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  step: number;
  total: number;
  className?: string;
}

export function QuestionCard({
  title,
  subtitle,
  required,
  children,
  footer,
  step,
  total,
  className,
}: QuestionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -120, scale: 0.92, filter: "blur(2px)" }}
      transition={{ type: "spring", stiffness: 230, damping: 28 }}
      className={cn(
        "relative w-full max-w-3xl mx-auto glass rounded-3xl p-6 sm:p-10",
        "shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] uppercase tracking-[0.28em] text-text-muted font-mono">
          Soru {step} / {total}
        </span>
        {required ? (
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#E8C97A] font-mono">
            Zorunlu
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
            İsteğe bağlı
          </span>
        )}
      </div>

      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base text-text-secondary">
          {subtitle}
        </p>
      )}

      <div className="mt-8">{children}</div>

      {footer && (
        <div className="mt-8 pt-6 border-t border-white/[0.06]">{footer}</div>
      )}
    </motion.div>
  );
}
