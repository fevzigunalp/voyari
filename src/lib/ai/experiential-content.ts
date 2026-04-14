/**
 * Experiential content generators — deterministic Turkish copy used as a
 * graceful fallback when the AI synthesizer cannot produce concrete data.
 *
 * Tier 3 of the fallback strategy: when no specific recommendation exists,
 * we still return premium-tone Voyari guidance so the UI never looks empty.
 */
import type {
  BudgetLevel,
  TravelerProfile,
} from "@/lib/types/traveler-profile";
import type {
  ChecklistItem,
  CountryInfo,
  CountryRule,
  DayPlan,
  DayWeather,
  EmergencyContact,
  HotelRecommendation,
  MealRecommendation,
  ReservationItem,
  TimelineItem,
} from "@/lib/types/plan";

/** Daily per-person spend (EUR) by budget level — used for estimates. */
export function dailyPerPersonByLevel(level: BudgetLevel | undefined): number {
  switch (level) {
    case "budget":
      return 60;
    case "moderate":
      return 110;
    case "comfortable":
      return 180;
    case "luxury":
      return 320;
    case "unlimited":
      return 550;
    default:
      return 130;
  }
}

export function totalEstimateFor(profile?: TravelerProfile): number {
  if (!profile) return 0;
  const days = Math.max(1, profile.totalDays || 1);
  const persons = Math.max(
    1,
    (profile.travelers?.adults ?? 1) + (profile.travelers?.children ?? 0),
  );
  return Math.round(dailyPerPersonByLevel(profile.budget?.level) * days * persons);
}

export function destinationCity(profile?: TravelerProfile): string {
  return (
    profile?.destination?.city ||
    profile?.destination?.region ||
    profile?.destination?.country ||
    "varış noktası"
  );
}

export function destinationCountry(profile?: TravelerProfile): string {
  return profile?.destination?.country || "Varış ülkesi";
}

export function currencyOf(profile?: TravelerProfile): string {
  return profile?.budget?.currency || "EUR";
}

/** Generic but warm hotel suggestion — never empty. */
export function experientialHotel(profile?: TravelerProfile): HotelRecommendation {
  const city = destinationCity(profile);
  const level = profile?.budget?.level;
  const stars = level === "luxury" || level === "unlimited" ? 5 : level === "comfortable" ? 4 : 3;
  return {
    name: "Merkezi konumda seçkin konaklama",
    stars,
    rating: 8.5,
    pricePerNight: 0,
    currency: currencyOf(profile),
    location: `${city} merkezi`,
    highlights: [
      "Merkezi konum",
      "Yürüme mesafesinde restoranlar",
      "Kolay ulaşım",
    ],
    parkingAvailable: true,
  };
}

/** Generic meal suggestion by slot. */
export function experientialMeal(
  slot: "breakfast" | "lunch" | "dinner",
  profile?: TravelerProfile,
): MealRecommendation {
  const city = destinationCity(profile);
  const map = {
    breakfast: {
      name: "Yerel kahvaltı mekanı önerisi",
      cuisine: "Bölgesel kahvaltı",
      mustTry: "Mevsim meyveleri ve taze fırın ürünleri",
    },
    lunch: {
      name: "Aile işletmesi lokanta önerisi",
      cuisine: "Bölgesel ev yemekleri",
      mustTry: "Mevsim sebzelerine dayalı günün menüsü",
    },
    dinner: {
      name: "Sakin akşam yemeği önerisi",
      cuisine: "Yerel mutfak",
      mustTry: "Şefin günlük önerisi",
    },
  } as const;
  const m = map[slot];
  return {
    restaurantName: m.name,
    cuisine: m.cuisine,
    mustTry: m.mustTry,
    pricePerPerson: 0,
    currency: currencyOf(profile),
    location: `${city} merkezi çevresi`,
    reservationNeeded: false,
  };
}

/** Build a single experiential timeline for a day. */
export function experientialTimeline(profile?: TravelerProfile): TimelineItem[] {
  const city = destinationCity(profile);
  return [
    {
      time: "09:00",
      endTime: "10:00",
      type: "meal",
      title: "Sakin bir kahvaltı",
      description: `${city}'da güne yerel bir kahvaltıyla başlayın — taze ekmek, mevsim meyveleri ve iyi bir kahve.`,
      bookingRequired: false,
      icon: "☕",
    },
    {
      time: "11:00",
      endTime: "13:00",
      type: "activity",
      title: "Tarihi merkez yürüyüşü",
      description:
        "Eski sokaklarda yavaş bir tempoyla keşif: meydanlar, küçük dükkanlar, fotoğraf molaları.",
      bookingRequired: false,
      icon: "🚶",
    },
    {
      time: "13:30",
      endTime: "15:00",
      type: "meal",
      title: "Bölgesel öğle yemeği",
      description:
        "Yerel ev yemekleri sunan küçük bir lokantada günün menüsünü deneyin.",
      bookingRequired: false,
      icon: "🍽️",
    },
    {
      time: "17:00",
      endTime: "19:00",
      type: "free_time",
      title: "Boş zaman ve dinlenme",
      description:
        "Otele dönüp serinleyin ya da sahil/manzaralı bir noktada gün batımını izleyin.",
      bookingRequired: false,
      icon: "🌅",
    },
    {
      time: "20:00",
      endTime: "22:00",
      type: "meal",
      title: "Akşam yemeği",
      description:
        "Atmosferi olan küçük bir mekanda — balıkçı lokantası ya da meyhane tadında — sakin bir akşam.",
      bookingRequired: false,
      icon: "🍷",
    },
  ];
}

export function experientialTips(profile?: TravelerProfile): string[] {
  const city = destinationCity(profile);
  return [
    `${city}'da öğle saatlerinde yerel halkın gittiği lokantaları tercih edin — fiyat/lezzet en iyi oranı orada bulursunuz.`,
    "Akşam üstü yürüyüş, gün ışığının değişen tonlarıyla en iyi fotoğraf zamanıdır.",
  ];
}

export function experientialDay(
  profile: TravelerProfile,
  dayNumber: number,
  date: string,
): DayPlan {
  const city = destinationCity(profile);
  const country = destinationCountry(profile);
  const persons = Math.max(
    1,
    (profile.travelers?.adults ?? 1) + (profile.travelers?.children ?? 0),
  );
  const dayBudget = Math.round(dailyPerPersonByLevel(profile.budget?.level) * persons);
  return {
    dayNumber,
    date,
    title: `Gün ${dayNumber} — ${city} keşfi`,
    subtitle: "Kendi temponuzda sakin bir gün",
    isTransitDay: dayNumber === 1,
    isDayOff: false,
    city,
    country,
    timeline: experientialTimeline(profile),
    accommodation: {
      primary: experientialHotel(profile),
      alternatives: [],
    },
    meals: {
      breakfast: experientialMeal("breakfast", profile),
      lunch: experientialMeal("lunch", profile),
      dinner: experientialMeal("dinner", profile),
    },
    tips: experientialTips(profile),
    rainPlan:
      "Yağmur durumunda kapalı mekanları tercih edin — müze, kafe, kapalı çarşı ya da otel spa alanı.",
    dayBudget,
  };
}

export function generateExperientialDays(
  profile: TravelerProfile,
  totalDays: number,
): DayPlan[] {
  const start = profile.startDate ? new Date(profile.startDate) : new Date();
  const days: DayPlan[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push(experientialDay(profile, i + 1, iso));
  }
  return days;
}

// ─── Logistics ────────────────────────────────────────────────────────────────

export function experientialCountryRule(profile?: TravelerProfile): CountryRule {
  return {
    country: destinationCountry(profile),
    speedLimits: {
      "şehir içi": "50 km/s",
      "şehirlerarası": "90 km/s",
      "otoyol": "120 km/s",
    },
    mandatoryEquipment: ["Reflektif yelek", "İlk yardım çantası", "Üçgen reflektör"],
    notes: [
      "Sürüş kuralları seyahat öncesi resmi kaynaktan teyit edilmelidir.",
    ],
  };
}

export function experientialEmergencyContacts(
  profile?: TravelerProfile,
): EmergencyContact[] {
  return [
    {
      country: destinationCountry(profile),
      label: "Acil (Avrupa)",
      number: "112",
    },
  ];
}

export function experientialPackingList(): ChecklistItem[] {
  const items = [
    { label: "Pasaport ve gerekli vize belgeleri", essential: true },
    { label: "Kredi kartı + bir miktar yerel para", essential: true },
    { label: "Şarj cihazı ve uygun seyahat adaptörü", essential: true },
    { label: "Konforlu yürüyüş ayakkabısı", essential: false },
    { label: "Hafif bir yağmurluk veya katlanır şemsiye", essential: false },
  ];
  return items.map((it, i) => ({
    id: `pack_${i}`,
    label: it.label,
    category: "Bavul",
    done: false,
    essential: it.essential,
  }));
}

export function experientialDocChecklist(): ChecklistItem[] {
  return [
    { label: "Pasaport (en az 6 ay geçerli)", essential: true },
    { label: "Seyahat sigortası belgesi", essential: true },
    { label: "Otel rezervasyon onayları (PDF/dijital)", essential: false },
  ].map((it, i) => ({
    id: `doc_${i}`,
    label: it.label,
    category: "Belgeler",
    done: false,
    essential: it.essential,
  }));
}

export function experientialVehicleChecklist(): ChecklistItem[] {
  return [
    { label: "Lastik basıncı ve diş derinliği kontrolü", essential: true },
    { label: "Motor yağı ve antifriz seviyesi", essential: true },
    { label: "Yedek lastik ve kriko", essential: true },
    { label: "Uluslararası sürüş belgesi (gerekli ülkelerde)", essential: false },
  ].map((it, i) => ({
    id: `veh_${i}`,
    label: it.label,
    category: "Araç",
    done: false,
    essential: it.essential,
  }));
}

export function experientialReservationTimeline(): ReservationItem[] {
  return [
    {
      id: "rsv_hotel",
      title: "Konaklama rezervasyonu",
      dueDate: "Seyahatten 3 hafta önce",
      notes: "Erken rezervasyon genellikle daha iyi fiyat ve oda seçeneği sağlar.",
    },
    {
      id: "rsv_transport",
      title: "Ulaşım biletleri",
      dueDate: "Seyahatten 2 hafta önce",
      notes: "Uçak, tren veya feribot biletleri için fiyatlar erken rezervasyonda avantajlıdır.",
    },
  ];
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetFallback {
  breakdown: { category: string; amount: number; percentage: number }[];
  dailyEstimates: { dayNumber: number; amount: number }[];
  totalEstimate: number;
  perPersonEstimate: number;
  currency: string;
  savingTips: string[];
}

export function experientialBudget(profile?: TravelerProfile): BudgetFallback {
  const total = totalEstimateFor(profile);
  const persons = Math.max(
    1,
    (profile?.travelers?.adults ?? 1) + (profile?.travelers?.children ?? 0),
  );
  const days = Math.max(1, profile?.totalDays ?? 1);
  const split: { category: string; pct: number }[] = [
    { category: "Konaklama", pct: 0.35 },
    { category: "Yemek", pct: 0.25 },
    { category: "Ulaşım", pct: 0.2 },
    { category: "Aktiviteler", pct: 0.15 },
    { category: "Diğer", pct: 0.05 },
  ];
  const dailyAvg = Math.round(total / days);
  return {
    breakdown: split.map((s) => ({
      category: s.category,
      amount: Math.round(total * s.pct),
      percentage: Math.round(s.pct * 100),
    })),
    dailyEstimates: Array.from({ length: days }, (_, i) => ({
      dayNumber: i + 1,
      amount: dailyAvg,
    })),
    totalEstimate: total,
    perPersonEstimate: Math.round(total / persons),
    currency: currencyOf(profile),
    savingTips: [
      "Erken rezervasyon konaklama ve ulaşımda 10-20% tasarruf sağlar.",
      "Yerel ulaşım kartları günlük tek bilete göre belirgin avantaj sunar.",
      "Günde bir zengin öğün + iki hafif öğün stratejisi hem bütçe hem rahat sindirim için iyidir.",
    ],
  };
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function experientialCountryInfo(profile?: TravelerProfile): CountryInfo {
  return {
    code: profile?.destination?.country?.slice(0, 2).toUpperCase() || "XX",
    name: destinationCountry(profile),
    currency: currencyOf(profile),
    language: ["Yerel dil"],
    plugType: "Avrupa tipi (C/F)",
    emergencyNumber: "112",
  };
}

export function experientialWeatherTips(): string[] {
  return [
    "Mevsim ortalamalarını hesaba katarak katmanlı giysi planlayın.",
    "Akşam serinliği için ince bir hırka veya şal her zaman işe yarar.",
  ];
}

export function experientialNarrative(profile?: TravelerProfile): {
  glanceTitle: string;
  emotionalSummary: string;
  whyPerfectForYou: string[];
  whatMakesUnique: string[];
} {
  const city = destinationCity(profile);
  const days = profile?.totalDays ?? 0;
  const pace = profile?.preferences?.pace || "balanced";
  return {
    glanceTitle: `${city}'da ${days} gün — sakin bir keşif`,
    emotionalSummary: `Bu seyahat, ${city}'ı kendi temponuzda hissetmeniz için tasarlandı. Telaşsız sabahlar, içten lezzetler ve sizinle uyumlu bir ritim.`,
    whyPerfectForYou: [
      `Tempo tercihiniz "${pace}" olduğu için her güne nefes alacak boşluklar bıraktık.`,
      "Bütçe seviyenizle uyumlu, abartısız ama özenli öneriler hazırlandı.",
      "Yerel deneyimleri ön planda tutan sakin bir akış kurguladık.",
    ],
    whatMakesUnique: [
      "Her gün bir ana deneyim + serbest bir keşif penceresi",
      "Yerel mutfağa odaklı yemek önerileri",
      "Esnek planlama: hava ya da ruh haline göre kolayca uyarlanabilir",
    ],
  };
}
