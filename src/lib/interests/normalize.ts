import { MAIN_BY_ID, SUB_BY_ID } from "./taxonomy";
import {
  EMPTY_INTERESTS,
  isInterestsValue,
  type InterestsValue,
  type LegacyInterestsValue,
} from "./types";

/**
 * Flatten a structured InterestsValue into the legacy lowercase Turkish
 * string[] expected by:
 *   - ProfileBuilder scoring (interests.includes("tarih") etc.)
 *   - AI prompt templates that read preferences.interests verbatim
 *   - result/preview page that renders a comma-joined list
 *
 * We emit BOTH: the polished sub-interest labels AND their legacy
 * aliases (e.g. "Tarih" + "tarih"), plus the main-category label.
 * Deduped, trimmed, lowercase-aware.
 */
export function flattenForAi(
  value: InterestsValue | LegacyInterestsValue | undefined,
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    // Legacy shape — just clean it.
    return Array.from(new Set(value.map((s) => s.trim()).filter(Boolean)));
  }
  if (!isInterestsValue(value)) return [];

  const out = new Set<string>();

  for (const mainId of value.mainCategories) {
    const main = MAIN_BY_ID[mainId];
    if (main) out.add(main.label);
  }

  for (const subId of value.subInterests) {
    const entry = SUB_BY_ID[subId];
    if (!entry) continue;
    out.add(entry.sub.label);
    for (const alias of entry.sub.aliases ?? []) {
      out.add(alias);
    }
  }

  return Array.from(out);
}

/**
 * Coerce any stored answer shape into a usable InterestsValue.
 * Accepts: undefined, legacy string[], or new InterestsValue.
 * Legacy values are mapped to subInterests where we can resolve them
 * by label/alias match, otherwise kept for backward compat via the
 * flattenForAi path (they still flow to prompts).
 */
export function toInterestsValue(
  input: unknown,
): InterestsValue {
  if (!input) return EMPTY_INTERESTS;
  if (isInterestsValue(input)) return input;

  if (Array.isArray(input)) {
    const subIds: string[] = [];
    const mainIds = new Set<string>();
    for (const raw of input as unknown[]) {
      if (typeof raw !== "string") continue;
      const needle = raw.trim().toLowerCase();
      for (const [id, { sub, mainId }] of Object.entries(SUB_BY_ID)) {
        if (
          sub.label.toLowerCase() === needle ||
          (sub.aliases ?? []).some((a) => a.toLowerCase() === needle)
        ) {
          subIds.push(id);
          mainIds.add(mainId);
          break;
        }
      }
    }
    const unique = Array.from(new Set(subIds));
    return {
      mainCategories: Array.from(mainIds),
      subInterests: unique,
      acceptedSuggestions: [],
      meta: { manualCount: unique.length, suggestedCount: 0 },
    };
  }

  return EMPTY_INTERESTS;
}

/** True if at least one main category selected. */
export function hasMinimumSelection(value: InterestsValue | undefined): boolean {
  return !!value && value.mainCategories.length > 0;
}
