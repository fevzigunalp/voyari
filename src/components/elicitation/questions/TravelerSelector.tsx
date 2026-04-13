"use client";

import { Minus, Plus, User, Users, Heart, Baby } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import type { QuestionComponentProps, TravelersValue } from "./types";
import type { TravelerGroup } from "@/lib/types/traveler-profile";

const GROUPS: { id: TravelerGroup; label: string; icon: React.ReactNode }[] = [
  { id: "solo", label: "Solo", icon: <User className="h-3.5 w-3.5" /> },
  { id: "couple", label: "Çift", icon: <Heart className="h-3.5 w-3.5" /> },
  { id: "family", label: "Aile", icon: <Baby className="h-3.5 w-3.5" /> },
  { id: "friends", label: "Arkadaş Grubu", icon: <Users className="h-3.5 w-3.5" /> },
  { id: "group", label: "Büyük Grup", icon: <Users className="h-3.5 w-3.5" /> },
];

const DEFAULT: TravelersValue = {
  adults: 2,
  children: 0,
  childAges: [],
  type: "couple",
};

function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${label} azalt`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30"
          disabled={value <= min}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="font-mono text-base text-[#E8C97A] min-w-[1.5rem] text-center">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label} arttır`}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30"
          disabled={value >= max}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function TravelerSelector({
  value,
  onChange,
}: QuestionComponentProps<TravelersValue>) {
  const v: TravelersValue = value ?? DEFAULT;

  const setAdults = (adults: number) => onChange({ ...v, adults });
  const setChildren = (children: number) => {
    const ages = [...v.childAges];
    while (ages.length < children) ages.push(8);
    ages.length = children;
    onChange({ ...v, children, childAges: ages });
  };
  const setAge = (i: number, age: number) => {
    const ages = [...v.childAges];
    ages[i] = age;
    onChange({ ...v, childAges: ages });
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <Counter
          label="Yetişkin"
          value={v.adults}
          onChange={setAdults}
          min={1}
        />
        <Counter
          label="Çocuk"
          value={v.children}
          onChange={setChildren}
        />
      </div>

      {v.children > 0 && (
        <div>
          <div className="text-xs text-text-muted uppercase tracking-[0.2em] font-mono mb-3">
            Çocuk Yaşları
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {v.childAges.map((age, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2 text-center"
              >
                <div className="text-[10px] text-text-muted">Çocuk {i + 1}</div>
                <input
                  type="number"
                  min={0}
                  max={17}
                  value={age}
                  onChange={(e) => setAge(i, Number(e.target.value))}
                  className="w-full bg-transparent text-center font-mono text-[#E8C97A] outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs text-text-muted uppercase tracking-[0.2em] font-mono mb-3">
          Seyahat Tipi
        </div>
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <Chip
              key={g.id}
              label={g.label}
              icon={g.icon}
              selected={v.type === g.id}
              onClick={() => onChange({ ...v, type: g.id })}
            />
          ))}
        </div>
      </div>

      <div className={cn("text-sm text-text-secondary text-center")}>
        Toplam{" "}
        <span className="font-mono text-[#E8C97A]">
          {v.adults + v.children}
        </span>{" "}
        kişi seyahat edecek.
      </div>
    </div>
  );
}
