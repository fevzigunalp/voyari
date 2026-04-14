"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CollectionCard } from "@/components/discovery/CollectionCard";
import { COLLECTIONS } from "@/lib/collections/data";
import { getSaved, subscribeSaved } from "@/lib/collections/saved";

export default function SavedPage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSlugs(getSaved());
    const unsub = subscribeSaved(() => setSlugs(getSaved()));
    return unsub;
  }, []);

  const items = COLLECTIONS.filter((c) => slugs.includes(c.slug));

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,83,0.12),transparent_60%)]" />
          <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-10 md:pt-28">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,168,83,0.4)] bg-[rgba(212,168,83,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#E8C97A]">
                <Bookmark className="h-3.5 w-3.5" />
                Koleksiyonum
              </div>
              <h1 className="mt-5 font-display text-4xl md:text-5xl tracking-tight">
                <span className="text-gradient-gold">Kaydettiklerim</span>
              </h1>
              <p className="mt-4 text-text-secondary">
                İlham aldığınız koleksiyonlar burada sizi bekliyor.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative pb-24">
          <div className="max-w-6xl mx-auto px-6">
            {!mounted ? (
              <div className="h-40" />
            ) : items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-12 text-center max-w-xl mx-auto"
              >
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(212,168,83,0.4)] bg-[rgba(212,168,83,0.1)]">
                  <Bookmark className="h-6 w-6 text-[#E8C97A]" strokeWidth={1.5} />
                </div>
                <h2 className="mt-5 font-display text-2xl tracking-tight">
                  Henüz kaydettiğiniz bir koleksiyon yok
                </h2>
                <p className="mt-3 text-text-secondary text-sm leading-relaxed">
                  İlham kütüphanesini keşfedin, beğendiklerinizi buraya ekleyin.
                </p>
                <Link
                  href="/inspire"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#E8C97A_0%,#D4A853_50%,#F59E0B_100%)] px-5 py-2.5 text-sm font-semibold text-[#0A0E1A] shadow-[0_10px_30px_-10px_rgba(212,168,83,0.6)]"
                >
                  <Sparkles className="h-4 w-4" />
                  İlham keşfet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c, i) => (
                  <CollectionCard key={c.slug} collection={c} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
