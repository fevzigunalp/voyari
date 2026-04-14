"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { CollectionCard } from "./CollectionCard";
import { COLLECTIONS } from "@/lib/collections/data";

const FEATURED_SLUGS = ["bodrum-gulet-chic", "kapadokya-balon-ruya", "japonya-kiraz"];

export function InspireTeaser() {
  const featured = FEATURED_SLUGS.map((s) =>
    COLLECTIONS.find((c) => c.slug === s),
  ).filter((c): c is (typeof COLLECTIONS)[number] => Boolean(c));

  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,168,83,0.4)] bg-[rgba(212,168,83,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#E8C97A]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              İlham
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-4 font-display text-4xl md:text-5xl tracking-tight"
            >
              İlham arıyor <span className="text-gradient-gold">musunuz?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-3 text-text-secondary"
            >
              Küratörlerimizin seçtiği koleksiyonlarla başlayın. Tek dokunuşla
              kendi planınıza dönüştürün.
            </motion.p>
          </div>
          <Link
            href="/inspire"
            className="inline-flex items-center gap-2 self-start md:self-end rounded-full border border-[rgba(212,168,83,0.45)] bg-[rgba(212,168,83,0.08)] px-4 py-2 text-sm text-[#E8C97A] hover:bg-[rgba(212,168,83,0.15)] transition-colors"
          >
            Tüm koleksiyonlar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => (
            <CollectionCard key={c.slug} collection={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
