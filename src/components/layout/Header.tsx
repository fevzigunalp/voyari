"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/plan", label: "Tatil Tasarla" },
  { href: "#features", label: "Nasıl Çalışır" },
];

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="absolute inset-0 bg-[rgba(10,14,26,0.7)] backdrop-blur-xl border-b border-white/[0.06]" />
      <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label="Voyari">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.28)] group-hover:border-[rgba(212,168,83,0.6)] transition-colors shadow-[0_6px_22px_-8px_rgba(212,168,83,0.5)]">
            <Image
              src="/logo-mark.svg"
              alt=""
              width={32}
              height={32}
              priority
              className="h-7 w-7"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-2xl tracking-tight text-gradient-gold">
              Voyari
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
              AI Travel Architect
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/plan">
            <Button size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
              Planlamaya Başla
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
