"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils/cn";

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
  className?: string;
  id?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  suffix,
  className,
  id,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  const handle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor={id} className="text-sm text-text-secondary">
            {label}
          </label>
          <span className="font-mono text-sm text-[#E8C97A]">
            {value}
            {suffix ? ` ${suffix}` : ""}
          </span>
        </div>
      )}
      <div className="relative h-10 flex items-center">
        <div
          className="absolute inset-x-0 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-[linear-gradient(90deg,#D4A853,#F59E0B)]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handle}
          className="relative z-10 w-full h-10 appearance-none bg-transparent cursor-pointer voyari-slider"
        />
      </div>
      <style jsx>{`
        .voyari-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #e8c97a, #d4a853);
          border: 2px solid #0a0e1a;
          box-shadow: 0 0 0 4px rgba(212, 168, 83, 0.18);
          cursor: grab;
        }
        .voyari-slider::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #e8c97a, #d4a853);
          border: 2px solid #0a0e1a;
          box-shadow: 0 0 0 4px rgba(212, 168, 83, 0.18);
          cursor: grab;
        }
      `}</style>
    </div>
  );
}
