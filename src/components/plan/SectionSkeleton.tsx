"use client";

/**
 * Small inline pill + shimmer shown on cards whose section has not yet merged
 * from the progressive enrichment fetches.
 */
export interface SectionSkeletonProps {
  label?: string;
  compact?: boolean;
}

export function SectionSkeleton({
  label = "İçerik hazırlanıyor...",
  compact = false,
}: SectionSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        compact
          ? "inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-amber-100"
          : "flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs font-mono uppercase tracking-wider text-amber-100"
      }
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
      {label}
    </div>
  );
}

export default SectionSkeleton;
