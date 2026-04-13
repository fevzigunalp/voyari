import type {
  AccommodationType,
  BudgetLevel,
  FoodStyle,
  PaceType,
  TransportType,
  TravelerGroup,
  VehicleInfo,
} from "@/lib/types/traveler-profile";

export interface QuestionComponentProps<T> {
  value: T | undefined;
  onChange: (value: T) => void;
}

export interface DateRangeValue {
  startDate: string; // ISO date
  endDate: string; // ISO date
  totalDays: number;
}

export interface TravelersValue {
  adults: number;
  children: number;
  childAges: number[];
  type: TravelerGroup;
}

export interface BudgetValue {
  level: BudgetLevel;
  dailyPerPerson?: number;
  currency: string;
}

export interface TransportValue {
  type: TransportType;
}

export interface AccommodationValue {
  type: AccommodationType;
  priorities: string[];
}

export interface DestinationValue {
  query: string;
  flexible: boolean;
  countryCode?: string;
}

export interface DepartureValue {
  query: string;
  countryCode?: string;
}

export interface PaceValue {
  pace: PaceType;
}

export interface FoodValue {
  style: FoodStyle;
  restrictions: string[];
}

export type VehicleValue = VehicleInfo;

export interface VisaValue {
  nationality: string;
  passportValid: boolean;
}

/**
 * Structured value produced by the redesigned InterestCloud.
 * Re-exported from @/lib/interests/types as the canonical source.
 */
export type { InterestsValue } from "@/lib/interests/types";

/**
 * Legacy interests value shape (plain TR string[]).
 * Retained for answer-migration code paths only.
 */
export type LegacyInterestsValue = string[];
