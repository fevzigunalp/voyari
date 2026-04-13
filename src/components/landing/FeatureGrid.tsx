"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Wallet,
  Map,
  FileDown,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "AI Araştırma Ekibi",
    description:
      "Rota, konaklama, restoran, aktivite ve lojistik için uzman ajanlar canlı web aramasıyla araştırır.",
    color: "#D4A853",
  },
  {
    icon: Sparkles,
    title: "Kişiselleştirilmiş Plan",
    description:
      "Seyahat DNA'nız, profil tipiniz ve ilgi alanlarınıza göre eşi olmayan bir program kurgular.",
    color: "#F59E0B",
  },
  {
    icon: Wallet,
    title: "Bütçe Analizi",
    description:
      "Kategori bazlı dağılım, gün bazlı harcama ve kişi başı toplamla şeffaf bir bütçe çıkarır.",
    color: "#10B981",
  },
  {
    icon: Map,
    title: "Harita Rotaları",
    description:
      "Tüm rota Leaflet harita üzerinde; gün gün etap, mola ve POI'lerle interaktif gösterilir.",
    color: "#38BDF8",
  },
  {
    icon: FileDown,
    title: "PDF Export",
    description:
      "Hazır planı tek tıkla PDF veya markdown olarak indir; offline ya da yazıcıya hazır.",
    color: "#FB7185",
  },
  {
    icon: MessagesSquare,
    title: "Adaptif Sorular",
    description:
      "Soru motoru cevaplarınıza göre akıllıca dallanır; gereksiz hiçbir soru sorulmaz.",
    color: "#E8C97A",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl tracking-tight"
          >
            Voyari nasıl <span className="text-gradient-gold">çalışır?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-text-secondary"
          >
            Sorularınızı yanıtlıyorsunuz; biz altı uzman AI ajanını çalıştırıp
            size özel bir tatil dosyası teslim ediyoruz.
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Card variant="glass" interactive className="h-full">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5"
                    style={{
                      background: `${f.color}1F`,
                      border: `1px solid ${f.color}55`,
                      boxShadow: `0 0 26px ${f.color}33`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: f.color }} strokeWidth={1.6} />
                  </div>
                  <h3 className="font-display text-xl tracking-tight mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
