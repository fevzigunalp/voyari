"use client";

import { motion } from "framer-motion";
import { Car, Fuel, Clock, CloudRain, Lightbulb, Wallet } from "lucide-react";
import type { DayPlan } from "@/lib/types/plan";
import { Card } from "@/components/ui/Card";
import { ActivityItem } from "./ActivityItem";
import { HotelCard } from "./HotelCard";
import { RestaurantCard } from "./RestaurantCard";
import { SectionSkeleton } from "./SectionSkeleton";

export interface DayCardProps {
  day: DayPlan;
  currency?: string;
  /** Per-section pending flags — when true, render skeleton pill instead. */
  pending?: {
    hotels?: boolean;
    restaurants?: boolean;
    activities?: boolean;
  };
}

export function DayCard({ day, currency, pending }: DayCardProps) {
  const timeline = day.timeline ?? [];
  const tips = day.tips ?? [];
  const primaryHotel = day.accommodation?.primary;
  const meals = day.meals ?? {};

  return (
    <motion.div
      key={`${day.dayNumber}-${day.date}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      <Card variant="glass">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E8C97A]">
              Gün {day.dayNumber} · {day.date}
            </div>
            <h2 className="font-display text-2xl md:text-3xl mt-1 text-gradient-gold">
              {day.title}
            </h2>
            {day.subtitle && (
              <p className="text-sm text-text-secondary mt-1">{day.subtitle}</p>
            )}
          </div>
          {typeof day.dayBudget === "number" && day.dayBudget > 0 && (
            <div className="rounded-xl border border-[rgba(212,168,83,0.3)] bg-[rgba(26,31,53,0.6)] px-3 py-2">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-muted font-mono">
                <Wallet className="h-3 w-3" /> Gün Bütçesi
              </div>
              <div className="font-display text-lg text-[#E8C97A]">
                {day.dayBudget.toLocaleString("tr-TR")} {currency || ""}
              </div>
            </div>
          )}
        </div>

        {day.driving && day.driving.distanceKm > 0 && (
          <div className="mt-4 grid gap-3 rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.4)] p-3 sm:grid-cols-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-mono flex items-center gap-1">
                <Car className="h-3 w-3" /> Rota
              </div>
              <div className="text-sm text-text-primary mt-0.5">
                {day.driving.fromCity} → {day.driving.toCity}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-mono">
                Mesafe
              </div>
              <div className="text-sm text-text-primary mt-0.5">
                {day.driving.distanceKm?.toLocaleString("tr-TR")} km
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" /> Süre
              </div>
              <div className="text-sm text-text-primary mt-0.5">
                {day.driving.durationHours} sa
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-mono flex items-center gap-1">
                <Fuel className="h-3 w-3" /> Yakıt + Geçiş
              </div>
              <div className="text-sm text-text-primary mt-0.5">
                {(
                  (day.driving.fuelCostEstimate ?? 0) +
                  (day.driving.tollCostEstimate ?? 0)
                ).toLocaleString("tr-TR")}{" "}
                {currency || ""}
              </div>
            </div>
          </div>
        )}
      </Card>

      {(timeline.length > 0 || pending?.activities) && (
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-text-primary">
              Zaman Çizelgesi
            </h3>
            {pending?.activities && <SectionSkeleton compact />}
          </div>
          <div className="flex flex-col gap-2">
            {timeline.map((t, i) => (
              <ActivityItem key={`${t.time}-${i}`} item={t} />
            ))}
          </div>
        </Card>
      )}

      {(primaryHotel || pending?.hotels) && (
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-text-primary">
              Konaklama
            </h3>
            {pending?.hotels && <SectionSkeleton compact />}
          </div>
          {primaryHotel && <HotelCard hotel={primaryHotel} />}
        </Card>
      )}

      {(meals.breakfast || meals.lunch || meals.dinner || pending?.restaurants) && (
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-text-primary">
              Yemek Önerileri
            </h3>
            {pending?.restaurants && <SectionSkeleton compact />}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {meals.breakfast && (
              <RestaurantCard meal={meals.breakfast} label="Kahvaltı" />
            )}
            {meals.lunch && (
              <RestaurantCard meal={meals.lunch} label="Öğle" />
            )}
            {meals.dinner && (
              <RestaurantCard meal={meals.dinner} label="Akşam" />
            )}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {tips.length > 0 && (
          <Card variant="default">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-[#E8C97A]" />
              <h3 className="font-display text-lg text-text-primary">
                İpuçları
              </h3>
            </div>
            <ul className="text-sm text-text-secondary space-y-1.5 list-disc list-inside">
              {tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </Card>
        )}
        {day.rainPlan && (
          <Card variant="default">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="h-4 w-4 text-sky-400" />
              <h3 className="font-display text-lg text-text-primary">
                Yağmur Planı
              </h3>
            </div>
            <p className="text-sm text-text-secondary">{day.rainPlan}</p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
