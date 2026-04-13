import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center px-6 py-24 bg-bg-primary text-text-primary">
      <div className="w-full max-w-lg rounded-3xl border border-[rgba(212,168,83,0.25)] bg-[rgba(26,31,53,0.6)] backdrop-blur-xl p-10 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(212,168,83,0.4)] bg-[rgba(212,168,83,0.1)]">
          <Compass className="h-7 w-7 text-[#E8C97A]" strokeWidth={1.6} />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
          404 · Sapma
        </div>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          Rotadan <span className="text-gradient-gold">çıktınız</span>
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Aradığınız sayfa bu seyahat planında yer almıyor. Pusulayı ana
          sayfaya çevirelim.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button
              variant="gold"
              size="md"
              leftIcon={<Home className="h-4 w-4" />}
            >
              Ana Sayfa
            </Button>
          </Link>
          <Link href="/plan">
            <Button variant="outline" size="md">
              Tatil Tasarla
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
