"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "gold" | "ghost" | "outline" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  gold:
    "text-[#0A0E1A] font-semibold shadow-[0_10px_30px_-10px_rgba(212,168,83,0.6)] " +
    "bg-[linear-gradient(135deg,#E8C97A_0%,#D4A853_50%,#F59E0B_100%)] " +
    "hover:shadow-[0_14px_40px_-10px_rgba(212,168,83,0.9)]",
  ghost:
    "text-text-primary bg-transparent hover:bg-white/5 border border-transparent",
  outline:
    "text-text-primary border border-[rgba(212,168,83,0.4)] hover:border-[rgba(212,168,83,0.8)] hover:bg-[rgba(212,168,83,0.08)]",
  subtle:
    "text-text-primary bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]",
  danger:
    "text-white bg-[linear-gradient(135deg,#FB7185_0%,#E11D48_100%)] hover:brightness-110",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-lg gap-2",
  md: "h-11 px-6 text-sm rounded-xl gap-2",
  lg: "h-14 px-8 text-base rounded-2xl gap-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "gold",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? undefined : { y: -1 }}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center font-sans transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed select-none",
          "relative overflow-hidden tracking-tight",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <span
            className="absolute inset-0 shimmer pointer-events-none opacity-60"
            aria-hidden="true"
          />
        )}
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  },
);
