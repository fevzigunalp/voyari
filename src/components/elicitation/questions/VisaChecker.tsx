"use client";

import { ShieldCheck } from "lucide-react";
import { COUNTRIES } from "@/lib/constants/countries";
import { cn } from "@/lib/utils/cn";
import type { QuestionComponentProps, VisaValue } from "./types";

const DEFAULT: VisaValue = { nationality: "TR", passportValid: true };

export function VisaChecker({
  value,
  onChange,
}: QuestionComponentProps<VisaValue>) {
  const v: VisaValue = value ?? DEFAULT;
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-3">
        <label className="block text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono mb-2">
          Pasaport (Vatandaşlık)
        </label>
        <select
          value={v.nationality}
          onChange={(e) => onChange({ ...v, nationality: e.target.value })}
          className="w-full bg-transparent outline-none text-base"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-[#0A0E1A]">
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange({ ...v, passportValid: !v.passportValid })}
        className={cn(
          "w-full flex items-center gap-3 rounded-2xl px-4 py-4 border transition-colors",
          v.passportValid
            ? "bg-[rgba(16,185,129,0.10)] border-[rgba(16,185,129,0.4)]"
            : "bg-[rgba(251,113,133,0.10)] border-[rgba(251,113,133,0.4)]",
        )}
      >
        <ShieldCheck
          className={cn(
            "h-5 w-5 shrink-0",
            v.passportValid ? "text-[#6EE7B7]" : "text-[#FDA4AF]",
          )}
        />
        <div className="text-left">
          <div className="font-medium text-sm">
            {v.passportValid
              ? "Pasaportum 6 aydan uzun süre geçerli"
              : "Pasaportum geçerlilik süresi yetersiz"}
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            Onaylamak/değiştirmek için tıklayın
          </div>
        </div>
      </button>
    </div>
  );
}
