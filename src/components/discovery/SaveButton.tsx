"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { isSaved, toggleSaved, subscribeSaved } from "@/lib/collections/saved";

interface SaveButtonProps {
  slug: string;
  className?: string;
  compact?: boolean;
}

export function SaveButton({ slug, className, compact = false }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isSaved(slug));
    const unsub = subscribeSaved(() => setSaved(isSaved(slug)));
    return unsub;
  }, [slug]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(slug);
  };

  const label = saved ? "Kaydedildi" : "Kaydet";
  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.94 }}
      aria-pressed={saved}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        saved
          ? "border-[rgba(212,168,83,0.55)] bg-[rgba(212,168,83,0.12)] text-[#E8C97A]"
          : "border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary hover:border-white/20",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      {mounted && !compact && <span>{label}</span>}
    </motion.button>
  );
}
