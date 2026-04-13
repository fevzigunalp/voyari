/**
 * Structured interests model for the 2-layer progressive disclosure
 * "Sizi ne heyecanlandırıyor?" step.
 *
 * mainCategories: snake_case ids of selected main categories
 * subInterests:   snake_case ids of selected sub-interests
 *                 (manual picks + accepted suggestions)
 * acceptedSuggestions: subset of subInterests that originated from
 *                      the "Seçiminize göre önerilenler" strip
 * meta: derived counts, useful for analytics / downstream scoring
 */
export interface InterestsValue {
  mainCategories: string[];
  subInterests: string[];
  acceptedSuggestions: string[];
  meta: {
    manualCount: number;
    suggestedCount: number;
  };
}

export interface SubInterest {
  id: string;
  label: string; // Turkish display label
  /** Extra TR synonyms appended when flattening for legacy AI prompts. */
  aliases?: string[];
}

export interface MainCategory {
  id: string;
  label: string;
  iconName:
    | "Landmark"
    | "UtensilsCrossed"
    | "Trees"
    | "Sparkles"
    | "Music"
    | "ShoppingBag"
    | "Leaf"
    | "Camera";
  /** Short TR description shown under the card title. */
  description: string;
  subs: SubInterest[];
}

/** Legacy shape (pre-refactor) — retained for migration helpers. */
export type LegacyInterestsValue = string[];

export function isInterestsValue(
  v: unknown,
): v is InterestsValue {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    Array.isArray(o.mainCategories) &&
    Array.isArray(o.subInterests) &&
    Array.isArray(o.acceptedSuggestions) &&
    typeof o.meta === "object" &&
    o.meta !== null
  );
}

export const EMPTY_INTERESTS: InterestsValue = {
  mainCategories: [],
  subInterests: [],
  acceptedSuggestions: [],
  meta: { manualCount: 0, suggestedCount: 0 },
};
