import { cn } from "@/lib/utils/cn";

export interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className, rounded = "rounded-xl" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "shimmer bg-white/[0.04] border border-white/[0.04]",
        rounded,
        className,
      )}
      aria-hidden="true"
    />
  );
}
