"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Bookmark } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CollectionCard } from "@/components/discovery/CollectionCard";
import { COLLECTIONS } from "@/lib/collections/data";

export default function InspirePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,83,0.12),transparent_60%)]" />
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-10 md:pt-28 md:pb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,168,83,0.4)] bg-[rgba(212,168,83,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#E8C97A]">
                <Sparkles className="h-3.5 w-3.5" />
                İlham Kütüphanesi
              </div>
              <h1 className="mt-5 font-display text-4xl md:text-6xl tracking-tight">
                İlham Dolu <span className="text-gradient-gold">Koleksiyonlar</span>
              </h1>
              <p className="mt-5 text-text-secondary text-base md:text-lg leading-relaxed">
                Seçkin seyahat kurguları. Her biri kendi hikayesini anlatıyor.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/saved"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:border-white/20 transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  Kaydettiklerim
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {COLLECTIONS.map((c, i) => (
                <CollectionCard key={c.slug} collection={c} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
