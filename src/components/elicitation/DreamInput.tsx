"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ExtractedIntent } from "@/lib/ai/schema";

const SUGGESTIONS: string[] = [
  "8 günlük Kapadokya balonlu ikonik tatil, 2 kişi, lüks bütçe, fotoğraf odaklı",
  "Bodrum gulet turu 10 gün, 4 arkadaş, konforlu bütçe, denizle iç içe",
  "Aileyle Hollanda road-trip haziran, 2 yetişkin 2 çocuk, 12 gün",
  "İtalya gastronomi turu 7 gün, çift, butik oteller, sakin tempo",
];

interface DreamInputProps {
  onBack: () => void;
  onExtracted: (intent: ExtractedIntent) => void;
}

const MAX_CHARS = 4000;

export function DreamInput({ onBack, onExtracted }: DreamInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = loading || text.trim().length < 4;

  const handleSubmit = async () => {
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/extract-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, MAX_CHARS) }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        intent?: ExtractedIntent;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(body?.error || "Niyet çıkarımı şu an yapılamıyor");
      }
      onExtracted(body.intent ?? {});
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Niyet çıkarımı şu an yapılamıyor";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Geri dön
        </button>

        <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[rgba(212,168,83,0.85)]">
          <Sparkles className="h-3.5 w-3.5" /> Hayalinizi anlatın
        </div>
        <h1 className="font-display text-2xl sm:text-3xl mt-3 text-gradient-gold">
          Nasıl bir seyahat hayal ediyorsunuz?
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Destinasyon, süre, bütçe, tempo — aklınıza ne geliyorsa yazın.
          Gerisini biz tamamlayalım.
        </p>

        <div className="mt-6 rounded-2xl border border-[rgba(212,168,83,0.2)] bg-[rgba(26,31,53,0.55)] backdrop-blur-xl p-4 focus-within:border-[rgba(212,168,83,0.55)] transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={6}
            placeholder="Örn. 10 gün Bodrum'da gulet turu, 2 kişi, lüks bütçe, denizle iç içe, sakin bir tempo..."
            className="w-full resize-y bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm sm:text-base leading-relaxed min-h-[160px]"
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted font-mono">
            <span>{text.length} / {MAX_CHARS}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-text-muted mb-2">
            Örnekler
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setText(s)}
                disabled={loading}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-text-secondary hover:border-[rgba(212,168,83,0.5)] hover:text-text-primary transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-7 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            variant="gold"
            onClick={handleSubmit}
            disabled={disabled}
            loading={loading}
            rightIcon={<Wand2 className="h-4 w-4" />}
          >
            {loading ? "Hayalinizi okuyoruz..." : "Devam et"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
