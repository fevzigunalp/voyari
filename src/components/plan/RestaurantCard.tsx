"use client";

import { Utensils, BookOpenCheck } from "lucide-react";
import type { MealRecommendation } from "@/lib/types/plan";
import { Badge } from "@/components/ui/Badge";

export interface RestaurantCardProps {
  meal: MealRecommendation;
  label: string;
}

export function RestaurantCard({ meal, label }: RestaurantCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Utensils className="h-3.5 w-3.5 text-[#E8C97A] shrink-0" />
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {label}
          </div>
        </div>
        {typeof meal.pricePerPerson === "number" && meal.pricePerPerson > 0 ? (
          <Badge tone="gold">
            {meal.pricePerPerson} {meal.currency}/kişi
          </Badge>
        ) : (
          <Badge tone="neutral">Fiyat aralığı: mevsimsel</Badge>
        )}
      </div>
      <div className="font-display text-base text-text-primary mt-1">
        {meal.restaurantName}
      </div>
      <div className="text-xs text-text-secondary mt-0.5">
        {meal.cuisine}
        {meal.mustTry ? ` · ${meal.mustTry}` : ""}
      </div>
      {meal.reservationNeeded && (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#E8C97A]">
          <BookOpenCheck className="h-3 w-3" />
          Rezervasyon gerekli
        </div>
      )}
    </div>
  );
}
