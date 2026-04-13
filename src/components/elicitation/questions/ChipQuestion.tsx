"use client";

import { Chip } from "@/components/ui/Chip";
import type { QuestionComponentProps } from "./types";

export interface ChipQuestionConfig {
  options: { id: string; label: string }[];
  multi: boolean;
}

export function makeSingleChip(options: { id: string; label: string }[]) {
  function SingleChipQuestion({
    value,
    onChange,
  }: QuestionComponentProps<string>) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            selected={value === o.id}
            onClick={() => onChange(o.id)}
          />
        ))}
      </div>
    );
  }
  return SingleChipQuestion;
}

export function makeMultiChip(options: { id: string; label: string }[]) {
  function MultiChipQuestion({
    value,
    onChange,
  }: QuestionComponentProps<string[]>) {
    const sel = value ?? [];
    const toggle = (id: string) => {
      onChange(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
    };
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            selected={sel.includes(o.id)}
            onClick={() => toggle(o.id)}
          />
        ))}
      </div>
    );
  }
  return MultiChipQuestion;
}

export function makeBoolChoice(yesLabel = "Evet", noLabel = "Hayır") {
  function BoolQuestion({
    value,
    onChange,
  }: QuestionComponentProps<boolean>) {
    return (
      <div className="flex gap-2">
        <Chip
          label={yesLabel}
          selected={value === true}
          onClick={() => onChange(true)}
        />
        <Chip
          label={noLabel}
          selected={value === false}
          onClick={() => onChange(false)}
        />
      </div>
    );
  }
  return BoolQuestion;
}
