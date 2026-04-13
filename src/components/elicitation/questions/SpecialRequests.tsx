"use client";

import type { QuestionComponentProps } from "./types";

export function SpecialRequests({
  value,
  onChange,
}: QuestionComponentProps<string>) {
  return (
    <div className="space-y-2">
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Sürpriz evlilik teklifi planı, doğum günü, fotoğraf çekimi, kabataban koyları, akraba ziyareti... aklınızdan ne geçiyorsa yazın."
        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[rgba(212,168,83,0.5)] rounded-2xl p-4 outline-none text-sm leading-relaxed resize-y"
      />
      <div className="text-xs text-text-muted font-mono uppercase tracking-[0.2em]">
        {value?.length ?? 0} karakter
      </div>
    </div>
  );
}
