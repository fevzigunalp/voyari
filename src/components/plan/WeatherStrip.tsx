"use client";

import { Droplets } from "lucide-react";
import { motion } from "framer-motion";
import type { DayWeather } from "@/lib/types/plan";
import { Card } from "@/components/ui/Card";

export interface WeatherStripProps {
  weather: DayWeather[];
}

export function WeatherStrip({ weather }: WeatherStripProps) {
  if (!weather || weather.length === 0) {
    return (
      <Card variant="default">
        <div className="text-sm text-text-muted">Hava durumu verisi yok.</div>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <h3 className="font-display text-lg mb-3">Günlük Hava</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weather.map((w, i) => (
          <motion.div
            key={`${w.date}-${i}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="min-w-[120px] rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] p-3"
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {w.date}
            </div>
            <div className="text-sm text-text-primary truncate">{w.city}</div>
            <div className="text-3xl my-2">{w.icon || "🌤️"}</div>
            <div className="font-mono text-sm text-[#E8C97A]">
              {w.tempMin}° / {w.tempMax}°
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-sky-300">
              <Droplets className="h-3 w-3" />
              {w.precipitationChance}%
            </div>
            <div className="text-[11px] text-text-secondary mt-1 line-clamp-2">
              {w.summary}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
