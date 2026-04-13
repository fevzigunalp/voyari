import type {
  TravelProfileType,
  TravelerProfile,
} from "@/lib/types/traveler-profile";

export type AnswersMap = Record<string, unknown>;

interface TransportAnswer {
  type?: TravelerProfile["transport"]["type"];
}

interface BudgetAnswer {
  level?: TravelerProfile["budget"]["level"];
  dailyPerPerson?: number;
  currency?: string;
}

interface TravelersAnswer {
  adults?: number;
  children?: number;
  childAges?: number[];
  type?: TravelerProfile["travelers"]["type"];
}

interface PreferencesPartial {
  interests?: string[];
}

const DEFAULT_SCORES: Record<TravelProfileType, number> = {
  luxury_sea: 0,
  road_trip: 0,
  caravan: 0,
  city_explorer: 0,
  family_fun: 0,
  adventure: 0,
  wellness: 0,
  backpacker: 0,
  cruise: 0,
  cultural_deep: 0,
  romantic: 0,
  gastro_tour: 0,
  photography: 0,
  digital_nomad: 0,
};

export function determineProfileType(answers: AnswersMap): TravelProfileType {
  const scores: Record<TravelProfileType, number> = { ...DEFAULT_SCORES };

  const transport = (answers.transport as TransportAnswer | undefined) ?? {};
  const budget = (answers.budget as BudgetAnswer | undefined) ?? {};
  const travelers = (answers.travelers as TravelersAnswer | undefined) ?? {};
  const interests = (answers.interests as string[] | undefined) ?? [];

  // Transport weighting
  if (transport.type === "gulet") scores.luxury_sea += 10;
  if (transport.type === "car") scores.road_trip += 8;
  if (transport.type === "caravan") scores.caravan += 10;
  if (transport.type === "cruise") scores.cruise += 10;
  if (transport.type === "trekking") scores.adventure += 8;
  if (transport.type === "bicycle") scores.adventure += 6;
  if (transport.type === "train") scores.city_explorer += 4;
  if (transport.type === "plane") scores.city_explorer += 2;

  // Budget weighting
  if (budget.level === "luxury" || budget.level === "unlimited") {
    scores.luxury_sea += 3;
    scores.romantic += 2;
    scores.wellness += 2;
  }
  if (budget.level === "budget") {
    scores.backpacker += 5;
  }

  // Traveler group weighting
  if (travelers.type === "couple") scores.romantic += 3;
  if (travelers.type === "family") scores.family_fun += 5;
  if (travelers.type === "solo") scores.backpacker += 2;
  if (travelers.type === "friends") scores.adventure += 1;

  // Interests
  if (interests.includes("tarih") || interests.includes("müze")) {
    scores.cultural_deep += 3;
  }
  if (interests.includes("yemek") || interests.includes("gastronomi")) {
    scores.gastro_tour += 3;
  }
  if (interests.includes("doğa") || interests.includes("macera")) {
    scores.adventure += 3;
  }
  if (interests.includes("spa") || interests.includes("wellness")) {
    scores.wellness += 5;
  }
  if (interests.includes("fotoğraf")) {
    scores.photography += 5;
  }
  if (interests.includes("plaj") || interests.includes("deniz")) {
    scores.luxury_sea += 2;
  }
  if (interests.includes("şehir") || interests.includes("alışveriş")) {
    scores.city_explorer += 2;
  }

  const ranked = (
    Object.entries(scores) as [TravelProfileType, number][]
  ).sort((a, b) => b[1] - a[1]);
  return ranked[0][0];
}
