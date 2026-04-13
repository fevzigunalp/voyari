/**
 * JSON repair utilities for LLM responses.
 * Keep dependency-free and edge-safe.
 */
import type { ZodType } from "zod";

export function stripFences(s: string): string {
  let t = s.trim();
  t = t.replace(/^```(?:json|JSON)?\s*/i, "");
  t = t.replace(/```\s*$/i, "");
  return t.trim();
}

/** Extract the first balanced {...} or [...] block. Falls back to index-based slice. */
export function extractJsonBlock(s: string): string {
  const t = s.trim();
  // Try balanced scan from first '{' or '['.
  const openIdx = (() => {
    const a = t.indexOf("{");
    const b = t.indexOf("[");
    if (a === -1) return b;
    if (b === -1) return a;
    return Math.min(a, b);
  })();
  if (openIdx === -1) return t;
  const open = t[openIdx];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = openIdx; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return t.slice(openIdx, i + 1);
    }
  }
  // Unbalanced — fallback to last matching char.
  const last = t.lastIndexOf(close);
  if (last > openIdx) return t.slice(openIdx, last + 1);
  return t.slice(openIdx);
}

export function fixTrailingCommas(s: string): string {
  return s.replace(/,\s*([}\]])/g, "$1");
}

export function tryParse<T = unknown>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export interface RepairResult<T> {
  data: T;
  repaired: boolean;
}

/**
 * Best-effort parse + zod-validate. Returns null on total failure.
 * `repaired` is true if we had to strip fences / extract block / fix commas.
 */
export function repairAndParse<T>(
  raw: string,
  schema: ZodType<T>,
): RepairResult<T> | null {
  if (!raw || typeof raw !== "string") return null;

  // Pass 1: try raw parse.
  let repaired = false;
  let parsed: unknown = tryParse(raw);
  if (parsed == null) {
    repaired = true;
    let t = stripFences(raw);
    const first = tryParse(t);
    if (first != null) {
      parsed = first;
    } else {
      t = extractJsonBlock(t);
      const second = tryParse(t);
      if (second != null) {
        parsed = second;
      } else {
        t = fixTrailingCommas(t);
        const third = tryParse(t);
        if (third != null) parsed = third;
      }
    }
  }
  if (parsed == null) return null;

  const result = schema.safeParse(parsed);
  if (!result.success) return null;
  return { data: result.data, repaired };
}
