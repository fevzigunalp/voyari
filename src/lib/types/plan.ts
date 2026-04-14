import type { TravelerProfile } from "./traveler-profile";

export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  language: string[];
  plugType: string;
  emergencyNumber: string;
}

export interface Waypoint {
  name: string;
  coordinates: [number, number];
  type: "departure" | "stop" | "destination" | "border";
  notes?: string;
}

export interface AlternativeRoute {
  label: string;
  description: string;
  distanceKm: number;
  durationHours: number;
}

export interface RestStop {
  name: string;
  coordinates?: [number, number];
  purpose: "fuel" | "food" | "view" | "rest" | "attraction";
  notes?: string;
}

export interface TimelineItem {
  time: string;
  endTime?: string;
  type: "activity" | "transport" | "meal" | "free_time" | "checkin" | "checkout";
  title: string;
  description: string;
  location?: string;
  cost?: number;
  currency?: string;
  bookingRequired: boolean;
  bookingUrl?: string;
  coordinates?: [number, number];
  icon: string;
}

export interface HotelRecommendation {
  name: string;
  stars?: number;
  rating?: number;
  pricePerNight: number;
  currency: string;
  location: string;
  highlights: string[];
  parkingAvailable: boolean;
  parkingCost?: number;
  coordinates?: [number, number];
  bookingUrl?: string;
}

export interface MealRecommendation {
  restaurantName: string;
  cuisine: string;
  mustTry: string;
  pricePerPerson: number;
  currency: string;
  location: string;
  reservationNeeded: boolean;
  coordinates?: [number, number];
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  title: string;
  subtitle?: string;
  isTransitDay: boolean;
  isDayOff: boolean;
  city: string;
  country: string;

  driving?: {
    fromCity: string;
    toCity: string;
    distanceKm: number;
    durationHours: number;
    route: string;
    fuelCostEstimate: number;
    tollCostEstimate: number;
    stops: RestStop[];
  };

  timeline: TimelineItem[];

  accommodation: {
    primary: HotelRecommendation;
    alternatives: HotelRecommendation[];
  };

  meals: {
    breakfast?: MealRecommendation;
    lunch?: MealRecommendation;
    dinner?: MealRecommendation;
  };

  tips: string[];
  rainPlan?: string;
  dayBudget: number;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface DailyBudget {
  dayNumber: number;
  amount: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  done: boolean;
  essential: boolean;
}

export interface ReservationItem {
  id: string;
  title: string;
  dueDate: string;
  notes?: string;
}

export interface EmergencyContact {
  country: string;
  label: string;
  number: string;
}

export interface CountryRule {
  country: string;
  speedLimits?: Record<string, string>;
  mandatoryEquipment?: string[];
  notes?: string[];
}

export interface PlanNarrative {
  glanceTitle: string;
  emotionalSummary: string;
  whyPerfectForYou: string[];
  whatMakesUnique: string[];
  signatureMoments?: string[];
}

export interface PlanReasoning {
  routeRationale?: string;
  pacingRationale?: string;
  budgetRationale?: string;
  personalizationNotes?: string[];
}

export interface DayWeather {
  date: string;
  city: string;
  tempMin: number;
  tempMax: number;
  precipitationChance: number;
  icon: string;
  summary: string;
}

export interface TravelPlan {
  id: string;
  profile: TravelerProfile;
  createdAt: string;

  route: {
    totalDistanceKm: number;
    totalDrivingHours: number;
    countries: CountryInfo[];
    waypoints: Waypoint[];
    alternativeRoutes?: AlternativeRoute[];
  };

  days: DayPlan[];

  budget: {
    breakdown: BudgetCategory[];
    dailyEstimates: DailyBudget[];
    totalEstimate: number;
    perPersonEstimate: number;
    currency: string;
    savingTips: string[];
  };

  logistics: {
    countryRules: CountryRule[];
    vehicleChecklist: ChecklistItem[];
    packingList: ChecklistItem[];
    documentChecklist: ChecklistItem[];
    reservationTimeline: ReservationItem[];
    emergencyContacts: EmergencyContact[];
  };

  weather: DayWeather[];

  narrative?: PlanNarrative;
  reasoning?: PlanReasoning;

  /** True when synthesis degraded and one or more sections are stubs. */
  partial?: boolean;
  /** Agent ids whose results are safe-fallback stubs. */
  partialAgents?: string[];
}
