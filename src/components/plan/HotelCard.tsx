"use client";

import { Star, MapPin, ParkingCircle, ExternalLink } from "lucide-react";
import type { HotelRecommendation } from "@/lib/types/plan";
import { Badge } from "@/components/ui/Badge";

export interface HotelCardProps {
  hotel: HotelRecommendation;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const highlights = hotel.highlights ?? [];
  return (
    <div className="rounded-xl border border-[rgba(212,168,83,0.25)] bg-[rgba(26,31,53,0.6)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display text-lg text-text-primary">
              {hotel.name}
            </div>
            {typeof hotel.stars === "number" && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-[#E8C97A] text-[#E8C97A]"
                  />
                ))}
              </div>
            )}
            {typeof hotel.rating === "number" && (
              <Badge tone="neutral">{hotel.rating.toFixed(1)}</Badge>
            )}
          </div>
          {hotel.location && (
            <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
              <MapPin className="h-3 w-3" />
              {hotel.location}
            </div>
          )}
        </div>
        {typeof hotel.pricePerNight === "number" && hotel.pricePerNight > 0 && (
          <div className="text-right shrink-0">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Gecelik
            </div>
            <div className="font-display text-xl text-[#E8C97A]">
              {hotel.pricePerNight.toLocaleString("tr-TR")}{" "}
              <span className="text-xs text-text-secondary">
                {hotel.currency}
              </span>
            </div>
          </div>
        )}
      </div>

      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {highlights.map((h) => (
            <Badge key={h} tone="neutral">
              {h}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-secondary">
        {typeof hotel.parkingAvailable === "boolean" && (
          <div className="flex items-center gap-1">
            <ParkingCircle className="h-3.5 w-3.5" />
            {hotel.parkingAvailable
              ? hotel.parkingCost
                ? `Otopark ${hotel.parkingCost} ${hotel.currency}`
                : "Otopark mevcut"
              : "Otopark dışarıda"}
          </div>
        )}
        {hotel.coordinates && (
          <div className="font-mono text-[10px] text-text-muted">
            {hotel.coordinates[0].toFixed(3)}, {hotel.coordinates[1].toFixed(3)}
          </div>
        )}
        {hotel.bookingUrl && (
          <a
            href={hotel.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-[#E8C97A] hover:underline"
          >
            Rezervasyon <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
