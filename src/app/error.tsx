"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[Voyari] runtime error:", error);
    }
  }, [error]);

  return (
    <main className="min-h-[100svh] flex items-center justify-center px-6 py-24 bg-bg-primary text-text-primary">
      <div className="w-full max-w-lg rounded-3xl border border-rose-400/30 bg-[rgba(26,31,53,0.6)] backdrop-blur-xl p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/40 bg-rose-500/10">
          <AlertTriangle className="h-7 w-7 text-rose-300" strokeWidth={1.6} />
        </div>
        <h1 className="font-display text-3xl tracking-tight">
          Beklenmedik bir hata oluştu
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Voyari bu isteği tamamlayamadı. Tekrar denemeyi deneyebilir ya da
          ana sayfaya dönebilirsiniz.
        </p>
        {error?.message && (
          <pre className="mt-4 max-h-28 overflow-auto rounded-xl border border-white/[0.06] bg-black/30 p-3 text-left text-[11px] text-rose-200 whitespace-pre-wrap">
            {error.message}
          </pre>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="gold"
            size="md"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => reset()}
          >
            Tekrar Dene
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Home className="h-4 w-4" />}
            >
              Ana Sayfa
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
