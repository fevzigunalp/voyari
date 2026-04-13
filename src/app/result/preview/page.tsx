"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTravelStore } from "@/lib/store/travel-store";
import { PROFILE_TYPES } from "@/lib/constants/profile-types";

export default function ResultPreviewPage() {
  const profile = useTravelStore((s) => s.profile);
  const profileType = profile.preferences?.profileType;
  const meta = profileType ? PROFILE_TYPES[profileType] : null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge tone="gold" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Profil Hazır · Phase 4 / 5 yakında
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-6">
              Yolculuk <span className="text-gradient-gold">DNA&apos;nız</span>
            </h1>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">
              Cevaplarınızı analiz ettik. Bir sonraki fazda AI ekibimiz uçtan
              uca araştırma yapıp tam planı bu sayfada üretecek.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {meta && (
              <Card variant="gold">
                <div className="text-5xl mb-3">{meta.icon}</div>
                <div className="text-xs uppercase tracking-[0.22em] text-text-muted font-mono">
                  Profil Tipi
                </div>
                <div className="font-display text-3xl text-[#E8C97A] mt-1">
                  {meta.label}
                </div>
                <p className="text-sm text-text-secondary mt-3">
                  {meta.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {meta.traits.map((t) => (
                    <Badge key={t} tone="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <Card variant="glass">
              <div className="text-xs uppercase tracking-[0.22em] text-text-muted font-mono mb-2">
                Özet
              </div>
              <ul className="text-sm space-y-2 text-text-secondary">
                <li>
                  Tarih:{" "}
                  <span className="text-text-primary font-mono">
                    {profile.startDate || "—"} → {profile.endDate || "—"} (
                    {profile.totalDays ?? 0} gün)
                  </span>
                </li>
                <li>
                  Çıkış:{" "}
                  <span className="text-text-primary">
                    {profile.departure?.city || "—"}
                  </span>
                </li>
                <li>
                  Varış:{" "}
                  <span className="text-text-primary">
                    {profile.destination?.flexible
                      ? "Voyari öneriyor"
                      : profile.destination?.city ||
                        profile.destination?.country ||
                        "—"}
                  </span>
                </li>
                <li>
                  Ulaşım:{" "}
                  <span className="text-text-primary">
                    {profile.transport?.type ?? "—"}
                  </span>
                </li>
                <li>
                  Bütçe:{" "}
                  <span className="text-text-primary">
                    {profile.budget?.level ?? "—"}
                  </span>
                </li>
                <li>
                  Tempo:{" "}
                  <span className="text-text-primary">
                    {profile.preferences?.pace ?? "—"}
                  </span>
                </li>
                <li>
                  İlgi alanları:{" "}
                  <span className="text-text-primary">
                    {profile.preferences?.interests?.join(", ") || "—"}
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            <Link href="/plan">
              <Button variant="outline">Cevapları Düzenle</Button>
            </Link>
            <Button disabled rightIcon={<ArrowRight className="h-4 w-4" />}>
              AI Araştırma · Phase 4
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
