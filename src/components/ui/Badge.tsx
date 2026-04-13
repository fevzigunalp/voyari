import { cn } from "@/lib/utils/cn";

type BadgeTone = "gold" | "emerald" | "sky" | "rose" | "amber" | "neutral";

export interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const toneClass: Record<BadgeTone, string> = {
  gold: "bg-[rgba(212,168,83,0.12)] text-[#E8C97A] border-[rgba(212,168,83,0.3)]",
  emerald: "bg-[rgba(16,185,129,0.12)] text-[#6EE7B7] border-[rgba(16,185,129,0.3)]",
  sky: "bg-[rgba(56,189,248,0.12)] text-[#7DD3FC] border-[rgba(56,189,248,0.3)]",
  rose: "bg-[rgba(251,113,133,0.12)] text-[#FDA4AF] border-[rgba(251,113,133,0.3)]",
  amber: "bg-[rgba(245,158,11,0.12)] text-[#FCD34D] border-[rgba(245,158,11,0.3)]",
  neutral: "bg-white/[0.05] text-text-secondary border-white/[0.08]",
};

export function Badge({ tone = "gold", children, className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium tracking-wide",
        toneClass[tone],
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
