"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { DateRangeValue, QuestionComponentProps } from "./types";
import { cn } from "@/lib/utils/cn";

const WEEK_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function buildMonthGrid(monthAnchor: Date): Date[] {
  const first = startOfMonth(monthAnchor);
  const last = endOfMonth(monthAnchor);
  const gridStart = startOfWeek(first, { weekStartsOn: 1 });
  const days: Date[] = [];
  let cursor = gridStart;
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

  // Local selection state — not bound directly to value, so clicks are always responsive.
  const [selStart, setSelStart] = useState<Date | null>(() =>
    value?.startDate ? parseISO(value.startDate) : null,
  );
  const [selEnd, setSelEnd] = useState<Date | null>(() =>
    value?.endDate && value.startDate !== value.endDate
      ? parseISO(value.endDate)
      : null,
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [dayCountInput, setDayCountInput] = useState<string>(() =>
    value?.totalDays ? String(value.totalDays) : "",
  );

  const grid = useMemo(() => buildMonthGrid(anchor), [anchor]);

  // Stable onChange ref to avoid re-firing on parent re-renders
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emitRange = useCallback((s: Date, e: Date) => {
    const [start, end] = isBefore(e, s) ? [e, s] : [s, e];
    const days = differenceInCalendarDays(end, start) + 1;
    onChangeRef.current({
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
      totalDays: days,
    });
    setDayCountInput(String(days));
  }, []);

  const handlePick = (d: Date) => {
    if (isBefore(d, addDays(today, -1))) return;

    // Hotel-style: no start or both set → begin fresh; only start → finalize
    if (!selStart || (selStart && selEnd)) {
      setSelStart(d);
      setSelEnd(null);
      return;
    }
    if (isSameDay(d, selStart)) {
      setSelStart(null);
      setSelEnd(null);
      return;
    }
    setSelEnd(d);
    emitRange(selStart, d);
  };

  const handleReset = () => {
    setSelStart(null);
    setSelEnd(null);
    setDayCountInput("");
  };

  const handleDayCountChange = (raw: string) => {
    // Strip non-digits
    const clean = raw.replace(/[^0-9]/g, "").slice(0, 3);
    setDayCountInput(clean);
    if (!clean) return;
    const n = parseInt(clean, 10);
    if (!n || n < 1) return;
    const base = selStart ?? today;
    const end = addDays(base, n - 1);
    if (!selStart) setSelStart(base);
    setSelEnd(end);
    setAnchor(end);
    emitRange(base, end);
  };

  // Visual helpers — show preview when hovering second date
  const rangeStart = selStart;
  const rangeEnd =
    selEnd ?? (selStart && hoverDate && !isBefore(hoverDate, selStart)
      ? hoverDate
      : null);
  const hoverFinalized = Boolean(selStart && selEnd);

  return (
    <div>
      {/* Day count input */}
      <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono mb-1">
            Kaç gün sürecek?
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="örn. 8"
              value={dayCountInput}
              onChange={(e) => handleDayCountChange(e.target.value)}
              className="w-20 bg-transparent border-b border-white/[0.15] focus:border-[#D4A853] outline-none font-display text-2xl text-[#E8C97A] px-1 py-1 transition-colors"
            />
            <span className="text-sm text-text-muted">
              gün → sistem bitiş tarihini otomatik seçer
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-4 py-3 text-sm transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Sıfırla
        </button>
      </div>

      {/* Month navigation */}
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

      <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoverDate(null)}>
        {grid.map((d) => {
          const inMonth = isSameMonth(d, anchor);
          const past = isBefore(d, addDays(today, -1));
          const isStart = rangeStart ? isSameDay(d, rangeStart) : false;
          const isEnd = rangeEnd ? isSameDay(d, rangeEnd) : false;
          const inRange =
            rangeStart && rangeEnd
              ? !isBefore(d, rangeStart) && !isAfter(d, rangeEnd)
              : false;
          const isPreview = !hoverFinalized && inRange && !isStart && !isEnd;
          return (
            <button
              type="button"
              key={d.toISOString()}
              onClick={() => handlePick(d)}
              onMouseEnter={() => setHoverDate(d)}
              disabled={past}
              className={cn(
                "h-10 rounded-lg text-sm font-medium transition-colors relative",
                inMonth ? "text-text-primary" : "text-text-muted/40",
                past && "opacity-30 cursor-not-allowed",
                !past && !inRange && "hover:bg-white/[0.05]",
                inRange &&
                  !isStart &&
                  !isEnd &&
                  "bg-[rgba(212,168,83,0.12)] text-[#E8C97A]",
                isPreview &&
                  "bg-[rgba(212,168,83,0.08)] outline outline-1 outline-[rgba(212,168,83,0.25)]",
                (isStart || isEnd) &&
                  "bg-[linear-gradient(135deg,#D4A853,#F59E0B)] text-[#0A0E1A] shadow-[0_0_24px_rgba(212,168,83,0.5)]",
              )}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>

      {/* Helper hint */}
      {selStart && !selEnd && (
        <div className="mt-4 text-center text-sm text-[#E8C97A]">
          Şimdi <strong>dönüş tarihini</strong> seçin — veya üstten gün sayısı
          yazın
        </div>
      )}

      {/* Summary */}
      {selStart && selEnd && (
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
              Başlangıç
            </div>
            <div className="font-display text-base mt-1">
              {format(
                isBefore(selEnd, selStart) ? selEnd : selStart,
                "d MMM",
                { locale: tr },
              )}
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
              Toplam
            </div>
            <div className="font-display text-base mt-1 text-[#E8C97A]">
              {differenceInCalendarDays(
                isBefore(selEnd, selStart) ? selStart : selEnd,
                isBefore(selEnd, selStart) ? selEnd : selStart,
              ) + 1}{" "}
              gün
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-mono">
              Bitiş
            </div>
            <div className="font-display text-base mt-1">
              {format(
                isBefore(selEnd, selStart) ? selStart : selEnd,
                "d MMM",
                { locale: tr },
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
