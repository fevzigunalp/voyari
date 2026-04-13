export type QuestionId =
  | "destination"
  | "departure"
  | "dates"
  | "travelers"
  | "transport"
  | "budget"
  | "vehicleInfo"
  | "transitStops"
  | "campingPreferences"
  | "guletPreferences"
  | "waterSports"
  | "cruisePreferences"
  | "fitnessLevel"
  | "bikeType"
  | "altitudeComfort"
  | "accommodation"
  | "interests"
  | "pace"
  | "food"
  | "childFriendlyPriorities"
  | "adventureTypes"
  | "wellnessTypes"
  | "culturalInterests"
  | "cuisineTypes"
  | "cookingClasses"
  | "photoInterests"
  | "goldenHourPriority"
  | "specialRequests";

export interface QuestionDefinition {
  id: QuestionId;
  title: string;
  subtitle?: string;
  required: boolean;
}

export interface QuestionFlow {
  core: QuestionId[];
  conditionalByTransport: Partial<Record<string, QuestionId[]>>;
  secondary: QuestionId[];
  conditionalByProfile: Partial<Record<string, QuestionId[]>>;
  final: QuestionId[];
}
