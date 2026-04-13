import type { MainCategory } from "./types";

/**
 * Two-layer interests taxonomy.
 * Ids are stable snake_case — safe to persist.
 * Labels are premium Turkish.
 *
 * Aliases on sub-interests include lowercase Turkish terms that the
 * existing ProfileBuilder scoring relies on (tarih, yemek, doğa,
 * macera, spa, wellness, fotoğraf, plaj, deniz, şehir, alışveriş,
 * müze, gastronomi). These are emitted by flattenForAi() so downstream
 * scoring keeps working without changes.
 */
export const INTEREST_TAXONOMY: MainCategory[] = [
  {
    id: "culture_heritage",
    label: "Kültür & Miras",
    iconName: "Landmark",
    description: "Tarih, sanat ve mimariyle derin bağlar",
    subs: [
      { id: "history", label: "Tarih", aliases: ["tarih"] },
      { id: "museums", label: "Müzeler", aliases: ["müze"] },
      { id: "architecture", label: "Mimari", aliases: ["mimari"] },
      { id: "ancient_sites", label: "Antik alanlar", aliases: ["tarih"] },
      { id: "religious_heritage", label: "Dini miras" },
      { id: "modern_art", label: "Modern sanat", aliases: ["sanat"] },
      { id: "literature", label: "Edebiyat rotaları" },
      { id: "local_traditions", label: "Yerel gelenekler" },
    ],
  },
  {
    id: "food_drink",
    label: "Yemek & İçecek",
    iconName: "UtensilsCrossed",
    description: "Damak tadınıza uygun lezzet rotaları",
    subs: [
      { id: "fine_dining", label: "Fine dining", aliases: ["gastronomi"] },
      { id: "street_food", label: "Sokak lezzetleri", aliases: ["sokak lezzetleri", "yemek"] },
      { id: "local_markets", label: "Yerel pazarlar", aliases: ["yerel pazar"] },
      { id: "wine_vineyards", label: "Şarap & bağ", aliases: ["şarap & bağ"] },
      { id: "coffee_culture", label: "Kahve kültürü" },
      { id: "cooking_class", label: "Mutfak atölyesi", aliases: ["yemek"] },
      { id: "seafood", label: "Deniz ürünleri", aliases: ["yemek"] },
      { id: "vegan_plantbased", label: "Vegan & bitki bazlı" },
    ],
  },
  {
    id: "nature_outdoor",
    label: "Doğa & Açık Hava",
    iconName: "Trees",
    description: "Kırsal rotalar, vahşi doğa, taze hava",
    subs: [
      { id: "hiking", label: "Doğa yürüyüşü", aliases: ["doğa"] },
      { id: "mountains", label: "Dağlar", aliases: ["doğa"] },
      { id: "lakes_rivers", label: "Göl & nehir", aliases: ["doğa"] },
      { id: "national_parks", label: "Milli parklar", aliases: ["doğa"] },
      { id: "wildlife", label: "Yaban hayatı", aliases: ["doğa"] },
      { id: "coastal_walks", label: "Sahil yürüyüşleri", aliases: ["deniz"] },
      { id: "forests", label: "Ormanlar", aliases: ["doğa"] },
      { id: "stargazing", label: "Yıldız gözlemi" },
    ],
  },
  {
    id: "activities_experiences",
    label: "Aktivite & Deneyim",
    iconName: "Sparkles",
    description: "Adrenalin ve hatırlanacak anlar",
    subs: [
      { id: "trekking", label: "Trekking", aliases: ["macera", "doğa"] },
      { id: "diving", label: "Dalış", aliases: ["macera", "deniz"] },
      { id: "safari", label: "Safari", aliases: ["macera"] },
      { id: "rafting", label: "Rafting", aliases: ["macera"] },
      { id: "paragliding", label: "Yamaç paraşütü", aliases: ["macera"] },
      { id: "sailing", label: "Yelken", aliases: ["deniz"] },
      { id: "climbing", label: "Tırmanış", aliases: ["macera"] },
      { id: "cycling_tours", label: "Bisiklet turu", aliases: ["macera"] },
    ],
  },
  {
    id: "social_nightlife",
    label: "Sosyal & Gece Hayatı",
    iconName: "Music",
    description: "Enerjili geceler ve canlı sahneler",
    subs: [
      { id: "rooftop_bars", label: "Çatı barları", aliases: ["gece hayatı"] },
      { id: "live_music", label: "Canlı müzik", aliases: ["müzik"] },
      { id: "clubs_dj", label: "Kulüp & DJ", aliases: ["gece hayatı"] },
      { id: "wine_bars", label: "Şarap barları", aliases: ["gece hayatı"] },
      { id: "festivals", label: "Festivaller", aliases: ["müzik"] },
      { id: "jazz_lounges", label: "Jazz lounge", aliases: ["müzik"] },
      { id: "speakeasy", label: "Speakeasy" },
      { id: "local_scene", label: "Yerel sahne", aliases: ["gece hayatı"] },
    ],
  },
  {
    id: "lifestyle_shopping",
    label: "Yaşam & Alışveriş",
    iconName: "ShoppingBag",
    description: "Tasarım, moda ve butik keşifler",
    subs: [
      { id: "luxury_brands", label: "Lüks markalar", aliases: ["alışveriş"] },
      { id: "concept_stores", label: "Concept store", aliases: ["alışveriş"] },
      { id: "artisan_crafts", label: "El sanatları", aliases: ["alışveriş"] },
      { id: "vintage_markets", label: "Vintage pazarlar", aliases: ["alışveriş"] },
      { id: "design_galleries", label: "Tasarım galerileri", aliases: ["sanat"] },
      { id: "boutique_shopping", label: "Butik alışveriş", aliases: ["alışveriş"] },
      { id: "urban_exploring", label: "Şehir keşfi", aliases: ["şehir"] },
      { id: "fashion_districts", label: "Moda semtleri", aliases: ["alışveriş", "şehir"] },
    ],
  },
  {
    id: "wellness_slow",
    label: "Wellness & Yavaş Seyahat",
    iconName: "Leaf",
    description: "Dinginlik, ritüel ve yeniden bağlanma",
    subs: [
      { id: "spa_retreats", label: "Spa inzivaları", aliases: ["spa", "wellness"] },
      { id: "yoga", label: "Yoga", aliases: ["wellness"] },
      { id: "thermal_springs", label: "Termal kaynaklar", aliases: ["spa"] },
      { id: "meditation", label: "Meditasyon", aliases: ["wellness"] },
      { id: "detox", label: "Detoks", aliases: ["wellness"] },
      { id: "slow_travel", label: "Yavaş seyahat" },
      { id: "forest_bathing", label: "Orman banyosu", aliases: ["doğa", "wellness"] },
      { id: "mindful_escapes", label: "Bilinçli kaçamaklar", aliases: ["wellness"] },
    ],
  },
  {
    id: "photography_aesthetics",
    label: "Fotoğraf & Estetik",
    iconName: "Camera",
    description: "Görsel hafıza ve altın saat rotaları",
    subs: [
      { id: "landscape_photo", label: "Manzara fotoğrafı", aliases: ["fotoğraf"] },
      { id: "street_photo", label: "Sokak fotoğrafı", aliases: ["fotoğraf"] },
      { id: "portrait_photo", label: "Portre", aliases: ["fotoğraf"] },
      { id: "astro_photo", label: "Astro fotoğrafçılık", aliases: ["fotoğraf"] },
      { id: "drone_photo", label: "Drone", aliases: ["fotoğraf"] },
      { id: "golden_hour", label: "Altın saat", aliases: ["fotoğraf"] },
      { id: "iconic_viewpoints", label: "İkonik manzaralar", aliases: ["fotoğraf"] },
      { id: "film_locations", label: "Film mekânları", aliases: ["fotoğraf"] },
    ],
  },
];

/** Quick lookup maps. */
export const MAIN_BY_ID: Record<string, MainCategory> = Object.fromEntries(
  INTEREST_TAXONOMY.map((m) => [m.id, m]),
);

export const SUB_BY_ID: Record<
  string,
  { sub: MainCategory["subs"][number]; mainId: string }
> = Object.fromEntries(
  INTEREST_TAXONOMY.flatMap((m) =>
    m.subs.map((s) => [s.id, { sub: s, mainId: m.id }] as const),
  ),
);

export function subsOfMain(mainId: string): MainCategory["subs"] {
  return MAIN_BY_ID[mainId]?.subs ?? [];
}
