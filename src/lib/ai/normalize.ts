/**
 * Defensive normalizer for AI-produced TravelPlan-shaped objects.
 *
 * Contract:
 *  - NEVER throws. Any malformed branch degrades to a safe empty value.
 *  - Always returns an object with the top-level TravelPlan shape:
 *    { route, days[], budget, logistics, weather, narrative? }
 *  - Coerces common aliases (totalDistance, totalDuration, total, perPerson).
 *  - String→number coercion when finite.
 */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function isValidCoord(v: unknown): v is [number, number] {
  return (
    Array.isArray(v) &&
    v.length === 2 &&
    typeof v[0] === "number" &&
    typeof v[1] === "number" &&
    Number.isFinite(v[0]) &&
    Number.isFinite(v[1])
  );
}

function normalizeWaypoint(w: unknown): Record<string, unknown> {
  if (!isRecord(w)) return { name: "", type: "stop" };
  const out: Record<string, unknown> = {
    name: asString(w.name),
    type: asString(w.type, "stop"),
  };
  if (isValidCoord(w.coordinates)) out.coordinates = w.coordinates;
  if (typeof w.notes === "string") out.notes = w.notes;
  return out;
}

function normalizeRoute(route: unknown): Record<string, unknown> {
  if (!isRecord(route)) {
    return {
      totalDistanceKm: 0,
      totalDrivingHours: 0,
      countries: [],
      waypoints: [],
    };
  }
  const distance = asNumber(
    route.totalDistanceKm ?? route.totalDistance ?? 0,
  );
  const hours = asNumber(
    route.totalDrivingHours ?? route.totalDuration ?? 0,
  );
  const out: Record<string, unknown> = {
    ...route,
    totalDistanceKm: distance,
    totalDrivingHours: hours,
    countries: asArray(route.countries),
    waypoints: asArray(route.waypoints).map(normalizeWaypoint),
  };
  if (Array.isArray(route.alternativeRoutes)) {
    out.alternativeRoutes = route.alternativeRoutes;
  }
  return out;
}

function normalizeBudget(budget: unknown): Record<string, unknown> {
  if (!isRecord(budget)) {
    return {
      breakdown: [],
      dailyEstimates: [],
      totalEstimate: 0,
      perPersonEstimate: 0,
      currency: "EUR",
      savingTips: [],
    };
  }
  return {
    ...budget,
    breakdown: asArray(budget.breakdown),
    dailyEstimates: asArray(budget.dailyEstimates),
    totalEstimate: asNumber(budget.totalEstimate ?? budget.total ?? 0),
    perPersonEstimate: asNumber(
      budget.perPersonEstimate ?? budget.perPerson ?? 0,
    ),
    currency: asString(budget.currency, "EUR"),
    savingTips: asArray(budget.savingTips),
  };
}

function normalizeLogistics(l: unknown): Record<string, unknown> {
  if (!isRecord(l)) {
    return {
      countryRules: [],
      vehicleChecklist: [],
      packingList: [],
      documentChecklist: [],
      reservationTimeline: [],
      emergencyContacts: [],
    };
  }
  return {
    ...l,
    countryRules: asArray(l.countryRules),
    vehicleChecklist: asArray(l.vehicleChecklist),
    packingList: asArray(l.packingList),
    documentChecklist: asArray(l.documentChecklist),
    reservationTimeline: asArray(l.reservationTimeline),
    emergencyContacts: asArray(l.emergencyContacts),
  };
}

function normalizeDay(day: unknown, idx: number): Record<string, unknown> {
  if (!isRecord(day)) {
    return {
      dayNumber: idx + 1,
      date: "",
      title: "",
      city: "",
      country: "",
      isTransitDay: false,
      isDayOff: false,
      timeline: [],
      accommodation: { alternatives: [] },
      meals: {},
      tips: [],
      dayBudget: 0,
    };
  }
  const out: Record<string, unknown> = {
    ...day,
    dayNumber: asNumber(day.dayNumber ?? idx + 1, idx + 1),
    date: asString(day.date),
    title: asString(day.title),
    city: asString(day.city),
    country: asString(day.country),
    isTransitDay: Boolean(day.isTransitDay),
    isDayOff: Boolean(day.isDayOff),
    timeline: asArray(day.timeline),
    tips: asArray(day.tips),
    dayBudget: asNumber(day.dayBudget),
  };
  // accommodation default
  if (isRecord(day.accommodation)) {
    out.accommodation = {
      ...day.accommodation,
      alternatives: asArray(day.accommodation.alternatives),
    };
  } else {
    out.accommodation = { alternatives: [] };
  }
  // meals default
  out.meals = isRecord(day.meals) ? day.meals : {};
  return out;
}

/**
 * Safe, never-throw normalizer. Returns a TravelPlan-shaped object.
 */
export function normalizePlan<T>(input: T): T {
  try {
    if (!isRecord(input)) {
      // Caller will merge with minimal plan — return an empty record.
      return {} as T;
    }
    const out: Record<string, unknown> = { ...input };
    out.route = normalizeRoute(input.route);
    out.days = asArray(input.days).map((d, i) => normalizeDay(d, i));
    out.budget = normalizeBudget(input.budget);
    out.logistics = normalizeLogistics(input.logistics);
    out.weather = asArray(input.weather);
    if (isRecord(input.narrative)) out.narrative = input.narrative;
    if (isRecord(input.reasoning)) out.reasoning = input.reasoning;
    return out as T;
  } catch {
    // Last-resort: never throw from normalize.
    return (isRecord(input) ? input : ({} as unknown)) as T;
  }
}
