"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Calendar,
  Compass,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SaveButton } from "@/components/discovery/SaveButton";
import type { Collection } from "@/lib/collections/types";
import { useElicitationStore } from "@/lib/store/elicitation-store";
import { cn } from "@/lib/utils/cn";

interface CollectionDetailProps {
  collection: Collection;
}

export function CollectionDetail({ collection }: CollectionDetailProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const seedFromCollection = useElicitationStore((s) => s.seedFromCollection);
  const existingAnswers = useElicitationStore((s) => s.answers);

  const iconLibrary = LucideIcons as unknown as Record<string, LucideIcon>;
  const Icon: LucideIcon = iconLibrary[collection.icon] ?? Sparkles;

  const hasExistingAnswers = useMemo(
    () => Object.keys(existingAnswers).length > 0,
    [existingAnswers],
  );

  const applySeedAndGo = (overwrite: boolean) => {
    seedFromCollection(collection.seedAnswers, { overwrite });
    router.push(`/plan?from=${collection.slug}`);
  };

  const handleStart = () => {
    if (hasExistingAnswers) {
      setConfirmOpen(true);
      return;
    }
    applySeedAndGo(false);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className={cn(
            "relative overflow-hidden bg-gradient-to-br",
            collection.heroGradient,
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(10,14,26,0.8),rgba(10,14,26,0.3)_60%)]" />
          <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href="/inspire"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Tüm koleksiyonlar
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-10 flex flex-col items-start gap-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/30 bg-white/10 backdrop-blur-md shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)]">
                <Icon className="h-10 w-10 text-white" strokeWidth={1.4} />
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/90 backdrop-blur">
                  {collection.vibe}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,168,83,0.55)] bg-black/40 px-3 py-1 text-xs text-[#E8C97A] backdrop-blur">
                  <Calendar className="h-3 w-3" />
                  {collection.sampleDays} gün
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl tracking-tight text-white max-w-3xl">
                {collection.title}
              </h1>
              <p className="text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
                {collection.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={handleStart}
                >
                  Bu ilhamla başla
                </Button>
                <SaveButton slug={collection.slug} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Highlights */}
        <section className="relative py-20">
          <div className="max-w-5xl mx-auto px-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                Bu <span className="text-gradient-gold">koleksiyonda</span>
              </h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Bu kurgu, Voyari küratörleri tarafından şekillendirildi. Dilerseniz
                olduğu gibi başlayın, dilerseniz kendi hikâyenize dönüştürün.
              </p>
              <ul className="mt-8 space-y-4">
                {collection.highlights.map((h, i) => (
                  <motion.li
                    key={h}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(212,168,83,0.5)] bg-[rgba(212,168,83,0.1)] text-[#E8C97A]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-text-primary/90 leading-relaxed">{h}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <aside className="glass rounded-3xl p-6 h-fit">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-text-muted">
                <Compass className="h-3.5 w-3.5" />
                Örnek Kurgu
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">Süre</dt>
                  <dd className="font-medium text-text-primary">
                    {collection.sampleDays} gün
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">Ulaşım</dt>
                  <dd className="font-medium text-text-primary capitalize">
                    {collection.sampleTransport}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">Profil</dt>
                  <dd className="font-medium text-text-primary capitalize">
                    {collection.sampleProfileType.replace(/_/g, " ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">Mood</dt>
                  <dd className="font-medium text-[#E8C97A] capitalize">
                    {collection.vibe}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 pt-6 border-t border-white/10">
                <Button
                  size="md"
                  className="w-full"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  onClick={handleStart}
                >
                  Bu ilhamla başla
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Mevcut seçimleriniz var"
        description="Bu koleksiyon, cevap vermiş olduğunuz alanlara dokunabilir."
        footer={
          <>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                setConfirmOpen(false);
                applySeedAndGo(false);
              }}
            >
              Mevcutları koru
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => {
                setConfirmOpen(false);
                applySeedAndGo(true);
              }}
            >
              Üzerine yaz
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Mevcut seçimlerinizin üzerine yazılsın mı? &quot;Mevcutları koru&quot; seçeneği
          sadece boş alanları dolduracak.
        </p>
      </Modal>
    </>
  );
}
