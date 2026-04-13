"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DateRangeValue, QuestionComponentProps } from "./types";
import { cn } from "@/lib/utils/cn";

const WEEK_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function buildMonthGrid(monthAnchor: Date): Date[] {
  const first = startOfMonth(monthAnchor);
  const last = endOfMonth(monthAnchor);
  const gridStart = startOfWeek(first, { weekStartsOn: 1 });
  const days: Date[] = [];
  let cursor = gridStart;
  // Always 6 weeks for layout stability
  while (days.length < 42) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    if (days.length >= 35 && isAfter(cursor, last)) break;
  }
  while (days.length % 7 !== 0) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function DatePicker({
  value,
  onChange,
}: QuestionComponentProps<DateRangeValue>) {
  const today = useMemo(() => new Date(), []);
  const [anchor, setAnchor] = useState<Date>(() =>
    value?.startDate ? parseISO(value.startDate) : today,
  );

  const start = value?.startDate ? parseISO(value.startDate) : null;
  const end = value?.endDate ? parseISO(value.endDate) : null;

  const grid = useMemo(() => buildMonthGrid(anchor), [anchor]);

  const handlePick = (d: Date) => {
    if (isBefore(d, addDays(today, -1))) return;
    if (!start || (start && end)) {
      onChange({
        startDate: format(d, "yyyy-MM-dd"),
        endDate: format(d, "yyyy-MM-dd"),
        totalDays: 1,
      });
      return;
    }
    if (start && !end) {
      if (isBefore(d, start)) {
        onChange({
          startDate: format(d, "yyyy-MM-dd"),
          endDate: format(start, "yyyy-MM-dd"),
          totalDays: differenceInCalendarDays(start, d) + 1,
        });
      } else {
        onChange({
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(d, "yyyy-MM-dd"),
          totalDays: differenceInCalendarDays(d, start) + 1,
        });
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          aria-label="Önceki ay"
          onClick={() => setAnchor((a) => addMonths(a, -1))}
          className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-display text-lg tracking-tight">
          {format(anchor, "LLLL yyyy", { locale: tr })}
        </div>
        <button
          type="button"
          aria-label="Sonraki ay"
          onClick={() => setAnchor((a) => addMonths(a, 1))}
          className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="text-[11px] uppercase text-text-muted text-center font-mono tracking-[0.18em]"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => {
          const inMonth = isSameMonth(d, anchor);
          const past = isBefore(d, addDays(today, -1));
          const isStart = start ? isSameDay(d, start) : false;
          const isEnd = end ? isSameDay(d, end) : false;
          const inRange =
            start && end ? !isBefore(d, start) && !isAfter(d, end) : false;
          return (
            <button
              type="button"
              key={d.toISOString()}
              onClick={() => handlePick(d)}
              disabled={past}
              className={cn(
                "h-10 rounded-lg text-sm font-medium transition-colors relative",
                inMonth ? "text-text-primary" : "text-text-muted/40",
                past && "opacity-30 cursor-not-allowed",
                !past && !inRange && "hover:bg-white/[0.05]",
                inRange && "bg-[rgba(212,168,83,0.12)] text-[#E8C97A]",
                (isStart || isEnd) &&
                  "bg-[linear-gradient(135deg,#D4A853,#F59E0B)] text-[#0A0E1A] shadow-[0_0_24px_rgba(212,168,83,0.5)]",
              )}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>

      {value && (
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
              Başlangıç
            </div>
            <div className="font-display text-base mt-1">
              {format(parseISO(value.startDate), "d MMM", { locale: tr })}
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
              Toplam
            </div>
            <div className="font-display text-base mt-1 text-[#E8C97A]">
              {value.totalDays} gün
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
              Bitiş
            </div>
            <div className="font-display text-base mt-1">
              {format(parseISO(value.endDate), "d MMM", { locale: tr })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
