"use client";

import { useMemo, useState } from "react";
import { Plane } from "lucide-react";
import { COUNTRIES } from "@/lib/constants/countries";
import { cn } from "@/lib/utils/cn";
import type { DepartureValue, QuestionComponentProps } from "./types";

export function DepartureInput({
  value,
  onChange,
}: QuestionComponentProps<DepartureValue>) {
  const [open, setOpen] = useState(false);
  const v: DepartureValue = value ?? { query: "" };

  const suggestions = useMemo(() => {
    if (!v.query) return COUNTRIES.slice(0, 6);
    const q = v.query.toLowerCase();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)).slice(
      0,
      6,
    );
  }, [v.query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] focus-within:border-[rgba(212,168,83,0.6)] px-4 py-3">
        <Plane className="h-4 w-4 text-[#E8C97A] shrink-0" />
        <input
          type="text"
          value={v.query}
          onChange={(e) => {
            onChange({ ...v, query: e.target.value, countryCode: undefined });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Çıkış şehrinizi yazın..."
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
  );
}
