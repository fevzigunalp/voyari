"use client";

import { useMemo, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { COUNTRIES } from "@/lib/constants/countries";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import type { DestinationValue, QuestionComponentProps } from "./types";

export function DestinationInput({
  value,
  onChange,
}: QuestionComponentProps<DestinationValue>) {
  const [open, setOpen] = useState(false);
  const v: DestinationValue = value ?? {
    query: "",
    flexible: false,
  };

  const suggestions = useMemo(() => {
    if (!v.query || v.flexible) return [];
    const q = v.query.toLowerCase();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)).slice(
      0,
      6,
    );
  }, [v.query, v.flexible]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Chip
          label="Bana Öner"
          icon={<Sparkles className="h-3.5 w-3.5" />}
          selected={v.flexible}
          onClick={() =>
            onChange({ ...v, flexible: !v.flexible, query: !v.flexible ? "" : v.query })
          }
        />
        <span className="text-xs text-text-muted">
          {v.flexible ? "Voyari sizin için seçecek" : "veya yazın:"}
        </span>
      </div>

      {!v.flexible && (
        <div className="relative">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] focus-within:border-[rgba(212,168,83,0.6)] px-4 py-3">
            <MapPin className="h-4 w-4 text-[#E8C97A] shrink-0" />
            <input
              type="text"
              value={v.query}
              onChange={(e) => {
                onChange({ ...v, query: e.target.value, countryCode: undefined });
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Şehir veya ülke yazın..."
              className="flex-1 bg-transparent outline-none text-base"
            />
          </div>

          {open && suggestions.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-2 rounded-xl bg-[var(--bg-card)] border border-white/[0.08] shadow-2xl overflow-hidden">
              {suggestions.map((c) => (
                <button
                  type="button"
                  key={c.code}
                  onClick={() =>
                    onChange({
                      ...v,
                      query: c.name,
                      countryCode: c.code,
                    })
                  }
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm hover:bg-white/[0.05] flex items-center justify-between",
                  )}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {c.code}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
