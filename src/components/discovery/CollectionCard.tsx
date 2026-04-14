"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { Collection } from "@/lib/collections/types";
import { SaveButton } from "./SaveButton";
import { cn } from "@/lib/utils/cn";

interface CollectionCardProps {
  collection: Collection;
  index?: number;
  className?: string;
}

export function CollectionCard({ collection, index = 0, className }: CollectionCardProps) {
  const iconLibrary = LucideIcons as unknown as Record<string, LucideIcon>;
  const Icon: LucideIcon = iconLibrary[collection.icon] ?? Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn("group relative", className)}
    >
      <Link
        href={`/inspire/${collection.slug}`}
        className="block overflow-hidden rounded-3xl border border-white/10 bg-[rgba(16,20,34,0.6)] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.8)] transition-colors hover:border-[rgba(212,168,83,0.4)]"
      >
        <div
          className={cn(
            "relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br",
            collection.heroGradient,
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.55),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110">
              <Icon className="h-9 w-9 text-white" strokeWidth={1.4} />
            </div>
          </div>
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            {collection.vibe}
          </div>
          <div className="absolute top-3 right-3 inline-flex items-center rounded-full border border-[rgba(212,168,83,0.55)] bg-black/40 px-2.5 py-1 text-[11px] font-medium text-[#E8C97A] backdrop-blur">
            {collection.sampleDays} gün
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl tracking-tight text-text-primary">
            {collection.title}
          </h3>
          <p className="mt-1.5 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {collection.subtitle}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
              İlham koleksiyonu
            </span>
            <SaveButton slug={collection.slug} compact />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
