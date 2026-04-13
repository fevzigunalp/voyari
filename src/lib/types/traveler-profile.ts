export type TravelProfileType =
  | "luxury_sea"
  | "road_trip"
  | "caravan"
  | "city_explorer"
  | "family_fun"
  | "adventure"
  | "wellness"
  | "backpacker"
  | "cruise"
  | "cultural_deep"
  | "romantic"
  | "gastro_tour"
  | "photography"
  | "digital_nomad";

export type TransportType =
  | "plane"
  | "car"
  | "caravan"
  | "gulet"
  | "train"
  | "cruise"
  | "bicycle"
  | "trekking"
  | "mixed";

export type BudgetLevel =
  | "budget"
  | "moderate"
  | "comfortable"
  | "luxury"
  | "unlimited";

export type AccommodationType =
  | "luxury"
  | "5star"
  | "4star"
  | "boutique"
  | "airbnb"
  | "hostel"
  | "camping"
  | "mixed";

export type TravelerGroup =
  | "solo"
  | "couple"
  | "family"
  | "friends"
  | "group";

export type PaceType = "packed" | "balanced" | "relaxed";

export type FoodStyle =
  | "local_explorer"
  | "familiar"
  | "self_cooking"
  | "mixed";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPoint {
  city: string;
  country: string;
  coordinates: [number, number];
}

export interface DestinationPoint {
  city?: string;
  country: string;
  region?: string;
  coordinates?: [number, number];
  flexible: boolean;
}

export interface VehicleInfo {
  make: string;
  model: string;
  fuelType: "diesel" | "gasoline" | "electric" | "hybrid";
  fuelConsumption: number;
}

export interface GuletPreferences {
  cabins: number;
  crewIncluded: boolean;
  waterSports: boolean;
}

export interface TravelerProfile {
  startDate: string;
  endDate: string;
  totalDays: number;
  departure: LocationPoint;
  destination: DestinationPoint;

  travelers: {
    adults: number;
    children: number;
    childAges?: number[];
    type: TravelerGroup;
  };

  budget: {
    level: BudgetLevel;
    dailyPerPerson?: number;
    totalMax?: number;
    currency: string;
  };

  transport: {
    type: TransportType;
    vehicle?: VehicleInfo;
    guletPreferences?: GuletPreferences;
  };

  accommodation: {
    type: AccommodationType;
    priorities: string[];
  };

  preferences: {
    profileType: TravelProfileType;
    /**
     * Flattened string[] projection of the structured interests answer.
     * Downstream AI prompts and scoring consume this shape. The full
     * structured object lives in the elicitation store under
     * `answers.interests` and is flattened via
     * `@/lib/interests/normalize#flattenForAi`.
     */
    interests: string[];
    pace: PaceType;
    food: {
      style: FoodStyle;
      restrictions?: string[];
    };
    transitStops: boolean;
    visitedBefore?: string[];
  };

  documents: {
    nationality: string;
    passportValid: boolean;
    visaFreeCountries?: string[];
  };
}
