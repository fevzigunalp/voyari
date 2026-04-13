"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlowEffect } from "@/components/ui/GlowEffect";

interface Particle {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

function generateParticles(count: number, seed: number): Particle[] {
  // Deterministic pseudo-random so SSR/CSR markup matches.
  const out: Particle[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    out.push({
      left: `${(rand() * 100).toFixed(2)}%`,
      top: `${(rand() * 100).toFixed(2)}%`,
      size: Math.round(rand() * 2 + 1),
      delay: `${(rand() * 6).toFixed(2)}s`,
      duration: `${(4 + rand() * 6).toFixed(2)}s`,
      opacity: 0.25 + rand() * 0.55,
    });
  }
  return out;
}

export function HeroSection() {
  const particles = useMemo(() => generateParticles(80, 7), []);
  const stars = useMemo(() => generateParticles(30, 19), []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 15% 10%, rgba(212, 168, 83, 0.18), transparent 60%), radial-gradient(900px 600px at 90% 80%, rgba(56, 189, 248, 0.10), transparent 60%)",
        }}
      />

      <GlowEffect className="-top-32 -left-24" color="#D4A853" size={620} intensity={0.28} />
      <GlowEffect className="bottom-0 -right-24" color="#38BDF8" size={520} intensity={0.18} />

      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={`p-${i}`}
            className="voyari-particle absolute rounded-full bg-[#E8C97A]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `voyari-twinkle ${p.duration} ease-in-out ${p.delay} infinite`,
              boxShadow: "0 0 6px rgba(232, 201, 122, 0.7)",
            }}
          />
        ))}
        {stars.map((p, i) => (
          <span
            key={`s-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: p.left,
              top: p.top,
              width: p.size + 1,
              height: p.size + 1,
              opacity: p.opacity * 0.7,
              animation: `voyari-twinkle ${p.duration} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Badge tone="gold" icon={<Sparkles className="h-3.5 w-3.5" />}>
            Ocianix tarafından sunulur
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.02]"
        >
          Hayalinizdeki Tatili{" "}
          <span className="text-gradient-gold">Tasarlayalım</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-text-secondary leading-relaxed"
        >
          Voyari, seyahat DNA&apos;nızı anlar; gulet turundan karavan macerasına,
          şehir keşfinden wellness kaçışına kadar uçtan uca, kişiye özel lüks
          tatil planları üretir.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/plan">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="animate-glow-pulse"
            >
              Tatilimi Tasarla
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Nasıl Çalışır
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-6 flex flex-col items-center gap-2 text-text-muted"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono">Keşfet</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <ChevronDown className="h-5 w-5 text-[#E8C97A]" />
          </motion.span>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes voyari-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
}
