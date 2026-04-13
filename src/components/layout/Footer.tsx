import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-[rgba(10,14,26,0.6)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(212,168,83,0.12)] border border-[rgba(212,168,83,0.3)]">
              <Compass className="h-5 w-5 text-[#E8C97A]" strokeWidth={1.6} />
            </span>
            <div className="leading-none">
              <div className="font-display text-2xl text-gradient-gold">
                Voyari
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
                AI Travel Architect
              </div>
            </div>
          </div>
          <p className="text-sm text-text-secondary max-w-md">
            Voyari; seyahat DNA&apos;nızı anlayıp uçtan uca, kişiye özel lüks
            tatil planları tasarlayan yapay zeka destekli bir seyahat
            mimarisidir.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg mb-3">Keşfet</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>
              <Link href="/plan" className="hover:text-[#E8C97A] transition-colors">
                Tatil Tasarla
              </Link>
            </li>
            <li>
              <Link href="/#features" className="hover:text-[#E8C97A] transition-colors">
                Nasıl Çalışır
              </Link>
            </li>
            <li>
              <Link href="/#profile" className="hover:text-[#E8C97A] transition-colors">
                Seyahat Profilleri
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-3">Ocianix</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>
              <a
                href="https://ocianix.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E8C97A] transition-colors"
              >
                ocianix.com
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@ocianix.com"
                className="hover:text-[#E8C97A] transition-colors"
              >
                hello@ocianix.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.06] py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
          <span>© {year} Voyari · Ocianix. Tüm hakları saklıdır.</span>
          <span className="font-mono">v0.1 · Phase 1</span>
        </div>
      </div>
    </footer>
  );
}
