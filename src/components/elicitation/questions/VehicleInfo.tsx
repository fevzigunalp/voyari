"use client";

import { Chip } from "@/components/ui/Chip";
import type { VehicleInfo as VehicleInfoType } from "@/lib/types/traveler-profile";
import type { QuestionComponentProps, VehicleValue } from "./types";

const FUEL_TYPES: VehicleInfoType["fuelType"][] = [
  "diesel",
  "gasoline",
  "hybrid",
  "electric",
];

const FUEL_LABELS: Record<VehicleInfoType["fuelType"], string> = {
  diesel: "Dizel",
  gasoline: "Benzin",
  hybrid: "Hibrit",
  electric: "Elektrik",
};

const DEFAULT: VehicleValue = {
  make: "",
  model: "",
  fuelType: "diesel",
  fuelConsumption: 7.5,
};

export function VehicleInfo({
  value,
  onChange,
}: QuestionComponentProps<VehicleValue>) {
  const v: VehicleValue = value ?? DEFAULT;

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-3">
          <label className="block text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono mb-1">
            Marka
          </label>
          <input
            type="text"
            value={v.make}
            onChange={(e) => onChange({ ...v, make: e.target.value })}
            placeholder="Volkswagen"
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-3">
          <label className="block text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono mb-1">
            Model
          </label>
          <input
            type="text"
            value={v.model}
            onChange={(e) => onChange({ ...v, model: e.target.value })}
            placeholder="California"
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <div className="text-xs text-text-muted uppercase tracking-[0.2em] font-mono mb-2">
          Yakıt Tipi
        </div>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((ft) => (
            <Chip
              key={ft}
              label={FUEL_LABELS[ft]}
              selected={v.fuelType === ft}
              onClick={() => onChange({ ...v, fuelType: ft })}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-3">
        <label className="block text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono mb-1">
          Ortalama Tüketim (L/100km veya kWh/100km)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            step={0.1}
            value={v.fuelConsumption}
            onChange={(e) =>
              onChange({ ...v, fuelConsumption: Number(e.target.value) })
            }
            className="w-full bg-transparent outline-none text-2xl font-display text-[#E8C97A]"
          />
          <span className="text-xs text-text-muted">/ 100km</span>
        </div>
      </div>
    </div>
  );
}
