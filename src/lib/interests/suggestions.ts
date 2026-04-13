import { MAIN_BY_ID } from "./taxonomy";

/**
 * For a given main category, return 3 sub-interest ids representing
 * the "essence" of that group. These power the dashed-gold
 * "Seçiminize göre önerilenler" strip.
 */
const SUGGESTIONS: Record<string, string[]> = {
  culture_heritage: ["history", "museums", "architecture"],
  food_drink: ["street_food", "local_markets", "wine_vineyards"],
  nature_outdoor: ["hiking", "national_parks", "coastal_walks"],
  activities_experiences: ["trekking", "diving", "sailing"],
  social_nightlife: ["rooftop_bars", "live_music", "wine_bars"],
  lifestyle_shopping: ["concept_stores", "artisan_crafts", "boutique_shopping"],
  wellness_slow: ["spa_retreats", "yoga", "slow_travel"],
  photography_aesthetics: ["golden_hour", "landscape_photo", "iconic_viewpoints"],
};

export function suggestionsFor(mainId: string): string[] {
  const list = SUGGESTIONS[mainId] ?? [];
  // Defensive: ensure every id actually exists under that main.
  const valid = new Set((MAIN_BY_ID[mainId]?.subs ?? []).map((s) => s.id));
  return list.filter((id) => valid.has(id));
}
