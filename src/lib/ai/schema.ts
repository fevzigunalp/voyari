/**
 * Lax zod schemas for AI agent outputs.
 *
 * Intent: validate the *shape* enough to reject totally broken responses, but
 * tolerate LLM variance. Most fields are optional. The synthesizer is the only
 * place we enforce a richer schema for the final TravelPlan — and even there
 * we stay permissive and coerce at the edge in plan-generator.ts.
 */
import { z } from "zod";

/** Generic lenient record — accepts any JSON object. Used for per-agent outputs. */
export const GenericObject = z.record(z.string(), z.unknown());

/** Lax schema for all research agents; they write freeform JSON the synthesizer consumes. */
export const RouteAgentSchema = GenericObject;
export const WeatherAgentSchema = GenericObject;
export const AccommodationAgentSchema = GenericObject;
export const RestaurantAgentSchema = GenericObject;
export const ActivityAgentSchema = GenericObject;
export const LogisticsAgentSchema = GenericObject;
export const BudgetAgentSchema = GenericObject;

/**
 * TravelPlan schema — mirrors src/lib/types/plan.ts but permissive.
 * All nested arrays default to empty; primitive fields default to safe values
 * so a partial response still yields a usable plan.
 */
const Coord = z.tuple([z.number(), z.number()]);

const CountryInfo = z
  .object({
    code: z.string().default(""),
    name: z.string().default(""),
    currency: z.string().default(""),
    language: z.array(z.string()).default([]),
    plugType: z.string().default(""),
    emergencyNumber: z.string().default(""),
  })
  .partial()
  .passthrough();

const Waypoint = z
  .object({
    name: z.string().default(""),
    coordinates: Coord.optional(),
    type: z.string().default("stop"),
    notes: z.string().optional(),
  })
  .partial()
  .passthrough();

const AlternativeRoute = z
  .object({
    label: z.string().default(""),
    description: z.string().default(""),
    distanceKm: z.number().default(0),
    durationHours: z.number().default(0),
  })
  .partial()
  .passthrough();

const RestStop = z
  .object({
    name: z.string().default(""),
    coordinates: Coord.optional(),
    purpose: z.string().default("rest"),
    notes: z.string().optional(),
  })
  .partial()
  .passthrough();

const TimelineItem = z
  .object({
    time: z.string().default(""),
    endTime: z.string().optional(),
    type: z.string().default("activity"),
    title: z.string().default(""),
    description: z.string().default(""),
    location: z.string().optional(),
    cost: z.number().optional(),
    currency: z.string().optional(),
    bookingRequired: z.boolean().default(false),
    bookingUrl: z.string().optional(),
    coordinates: Coord.optional(),
    icon: z.string().default(""),
  })
  .partial()
  .passthrough();

const HotelRecommendation = z
  .object({
    name: z.string().default(""),
    stars: z.number().optional(),
    rating: z.number().optional(),
    pricePerNight: z.number().default(0),
    currency: z.string().default(""),
    location: z.string().default(""),
    highlights: z.array(z.string()).default([]),
    parkingAvailable: z.boolean().default(false),
    parkingCost: z.number().optional(),
    coordinates: Coord.optional(),
    bookingUrl: z.string().optional(),
  })
  .partial()
  .passthrough();

const MealRecommendation = z
  .object({
    restaurantName: z.string().default(""),
    cuisine: z.string().default(""),
    mustTry: z.string().default(""),
    pricePerPerson: z.number().default(0),
    currency: z.string().default(""),
    location: z.string().default(""),
    reservationNeeded: z.boolean().default(false),
    coordinates: Coord.optional(),
  })
  .partial()
  .passthrough();

const DayPlan = z
  .object({
    dayNumber: z.number().default(1),
    date: z.string().default(""),
    title: z.string().default(""),
    subtitle: z.string().optional(),
    isTransitDay: z.boolean().default(false),
    isDayOff: z.boolean().default(false),
    city: z.string().default(""),
    country: z.string().default(""),
    driving: z
      .object({
        fromCity: z.string().default(""),
        toCity: z.string().default(""),
        distanceKm: z.number().default(0),
        durationHours: z.number().default(0),
        route: z.string().default(""),
        fuelCostEstimate: z.number().default(0),
        tollCostEstimate: z.number().default(0),
        stops: z.array(RestStop).default([]),
      })
      .partial()
      .passthrough()
      .optional(),
    timeline: z.array(TimelineItem).default([]),
    accommodation: z
      .object({
        primary: HotelRecommendation.optional(),
        alternatives: z.array(HotelRecommendation).default([]),
      })
      .partial()
      .passthrough()
      .default({}),
    meals: z
      .object({
        breakfast: MealRecommendation.optional(),
        lunch: MealRecommendation.optional(),
        dinner: MealRecommendation.optional(),
      })
      .partial()
      .passthrough()
      .default({}),
    tips: z.array(z.string()).default([]),
    rainPlan: z.string().optional(),
    dayBudget: z.number().default(0),
  })
  .partial()
  .passthrough();

const BudgetCategory = z
  .object({
    category: z.string().default(""),
    amount: z.number().default(0),
    percentage: z.number().default(0),
  })
  .partial()
  .passthrough();

const DailyBudget = z
  .object({
    dayNumber: z.number().default(1),
    amount: z.number().default(0),
  })
  .partial()
  .passthrough();

const ChecklistItem = z
  .object({
    id: z.string().default(""),
    label: z.string().default(""),
    category: z.string().default(""),
    done: z.boolean().default(false),
    essential: z.boolean().default(false),
  })
  .partial()
  .passthrough();

const ReservationItem = z
  .object({
    id: z.string().default(""),
    title: z.string().default(""),
    dueDate: z.string().default(""),
    notes: z.string().optional(),
  })
  .partial()
  .passthrough();

const EmergencyContact = z
  .object({
    country: z.string().default(""),
    label: z.string().default(""),
    number: z.string().default(""),
  })
  .partial()
  .passthrough();

const CountryRule = z
  .object({
    country: z.string().default(""),
    speedLimits: z.record(z.string(), z.string()).optional(),
    mandatoryEquipment: z.array(z.string()).optional(),
    notes: z.array(z.string()).optional(),
  })
  .partial()
  .passthrough();

const DayWeather = z
  .object({
    date: z.string().default(""),
    city: z.string().default(""),
    tempMin: z.number().default(0),
    tempMax: z.number().default(0),
    precipitationChance: z.number().default(0),
    icon: z.string().default(""),
    summary: z.string().default(""),
  })
  .partial()
  .passthrough();

export const TravelPlanSchema = z
  .object({
    id: z.string().optional(),
    profile: z.unknown().optional(),
    createdAt: z.string().optional(),
    route: z
      .object({
        totalDistanceKm: z.number().default(0),
        totalDrivingHours: z.number().default(0),
        countries: z.array(CountryInfo).default([]),
        waypoints: z.array(Waypoint).default([]),
        alternativeRoutes: z.array(AlternativeRoute).optional(),
      })
      .partial()
      .passthrough()
      .default({}),
    days: z.array(DayPlan).default([]),
    budget: z
      .object({
        breakdown: z.array(BudgetCategory).default([]),
        dailyEstimates: z.array(DailyBudget).default([]),
        totalEstimate: z.number().default(0),
        perPersonEstimate: z.number().default(0),
        currency: z.string().default(""),
        savingTips: z.array(z.string()).default([]),
      })
      .partial()
      .passthrough()
      .default({}),
    logistics: z
      .object({
        countryRules: z.array(CountryRule).default([]),
        vehicleChecklist: z.array(ChecklistItem).default([]),
        packingList: z.array(ChecklistItem).default([]),
        documentChecklist: z.array(ChecklistItem).default([]),
        reservationTimeline: z.array(ReservationItem).default([]),
        emergencyContacts: z.array(EmergencyContact).default([]),
      })
      .partial()
      .passthrough()
      .default({}),
    weather: z.array(DayWeather).default([]),
  })
  .passthrough();

export type TravelPlanSchemaType = z.infer<typeof TravelPlanSchema>;
