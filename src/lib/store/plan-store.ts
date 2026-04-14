"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  TravelPlan,
  HotelRecommendation,
  MealRecommendation,
  TimelineItem,
  DayPlan,
  DayWeather,
  CountryRule,
  ChecklistItem,
  ReservationItem,
  EmergencyContact,
  BudgetCategory,
  DailyBudget,
} from "@/lib/types/plan";
import type { ResearchAgentState } from "@/lib/types/research";

export type PlanSliceSection =
  | "hotels"
  | "restaurants"
  | "activities"
  | "logistics"
  | "budget"
  | "weather";

export type PlanSliceStatus = "pending" | "loading" | "done" | "error";

interface PlanStoreState {
  plans: Record<string, TravelPlan>;
  plan: TravelPlan | null;
  researchAgents: ResearchAgentState[];
  /** Per-plan per-section fetch status, used for progressive UI skeletons. */
  sliceStatus: Record<string, Partial<Record<PlanSliceSection, PlanSliceStatus>>>;
  generating: boolean;
  error: string | null;
  savePlan: (plan: TravelPlan) => void;
  getPlan: (id: string) => TravelPlan | undefined;
  setPlan: (plan: TravelPlan | null) => void;
  setAgents: (agents: ResearchAgentState[]) => void;
  updateAgent: (id: string, patch: Partial<ResearchAgentState>) => void;
  setGenerating: (flag: boolean) => void;
  setError: (error: string | null) => void;
  setSliceStatus: (
    planId: string,
    section: PlanSliceSection,
    status: PlanSliceStatus,
  ) => void;
  mergePlanSlice: (
    planId: string,
    section: PlanSliceSection,
    data: unknown,
  ) => void;
  reset: () => void;
  clearPlans: () => void;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Pure merge helper — given a plan and a section slice, return a NEW plan
 * with the slice deep-merged. Idempotent (calling twice with same section
 * replaces the previous slice).
 */
export function mergeSliceIntoPlan(
  plan: TravelPlan,
  section: PlanSliceSection,
  data: unknown,
): TravelPlan {
  if (!isRecord(data)) return plan;

  switch (section) {
    case "hotels": {
      const recs = asArray<HotelRecommendation>(data["recommendations"]);
      if (recs.length === 0) return plan;
      const days = plan.days.map((d, i) => {
        const primary = recs[i % recs.length] ?? d.accommodation?.primary;
        const alternatives = recs
          .filter((_, idx) => idx !== i % recs.length)
          .slice(0, 2);
        return {
          ...d,
          accommodation: {
            primary: primary ?? d.accommodation?.primary,
            alternatives:
              alternatives.length > 0
                ? alternatives
                : (d.accommodation?.alternatives ?? []),
          },
        } as DayPlan;
      });
      return { ...plan, days };
    }
    case "restaurants": {
      const meals = asArray<MealRecommendation>(data["meals"]);
      if (meals.length === 0) return plan;
      const bySlot = {
        breakfast: meals.find((m) =>
          /kahvalt|breakfast/i.test(`${m.mustTry ?? ""} ${m.cuisine ?? ""}`),
        ),
        lunch: meals.find((m) => /öğle|lunch/i.test(m.cuisine ?? "")),
        dinner: meals.find((m) => /akşam|dinner/i.test(m.cuisine ?? "")),
      };
      const days = plan.days.map((d, i) => {
        const breakfast =
          bySlot.breakfast ?? meals[(i * 3) % meals.length] ?? d.meals?.breakfast;
        const lunch =
          bySlot.lunch ?? meals[(i * 3 + 1) % meals.length] ?? d.meals?.lunch;
        const dinner =
          bySlot.dinner ?? meals[(i * 3 + 2) % meals.length] ?? d.meals?.dinner;
        return {
          ...d,
          meals: {
            ...(breakfast ? { breakfast } : {}),
            ...(lunch ? { lunch } : {}),
            ...(dinner ? { dinner } : {}),
          },
        } as DayPlan;
      });
      return { ...plan, days };
    }
    case "activities": {
      const rawActs = asArray<Record<string, unknown>>(data["activities"]);
      if (rawActs.length === 0) return plan;
      const perDay = Math.max(1, Math.ceil(rawActs.length / plan.days.length));
      const days = plan.days.map((d, i) => {
        const slice = rawActs.slice(i * perDay, (i + 1) * perDay);
        const items: TimelineItem[] = slice.map((a, idx) => ({
          time: `${String(10 + idx * 2).padStart(2, "0")}:00`,
          type: "activity",
          title: typeof a["title"] === "string" ? (a["title"] as string) : "Aktivite",
          description:
            typeof a["description"] === "string"
              ? (a["description"] as string)
              : "",
          bookingRequired:
            typeof a["bookingRequired"] === "boolean"
              ? (a["bookingRequired"] as boolean)
              : false,
          ...(typeof a["cost"] === "number"
            ? { cost: a["cost"] as number }
            : {}),
          icon: "🎯",
        }));
        return {
          ...d,
          timeline: items.length > 0 ? items : d.timeline,
        } as DayPlan;
      });
      return { ...plan, days };
    }
    case "logistics": {
      const countryRules = asArray<CountryRule>(data["countryRules"]);
      const emergencyContacts = asArray<EmergencyContact>(
        data["emergencyContacts"],
      );
      const packingList = asArray<ChecklistItem>(data["packingList"]);
      const vehicleChecklist = asArray<ChecklistItem>(data["vehicleChecklist"]);
      const documentChecklist = asArray<ChecklistItem>(data["documentChecklist"]);
      const reservationTimeline = asArray<ReservationItem>(
        data["reservationTimeline"],
      );
      return {
        ...plan,
        logistics: {
          countryRules:
            countryRules.length > 0 ? countryRules : plan.logistics.countryRules,
          emergencyContacts:
            emergencyContacts.length > 0
              ? emergencyContacts
              : plan.logistics.emergencyContacts,
          packingList:
            packingList.length > 0 ? packingList : plan.logistics.packingList,
          vehicleChecklist:
            vehicleChecklist.length > 0
              ? vehicleChecklist
              : plan.logistics.vehicleChecklist,
          documentChecklist:
            documentChecklist.length > 0
              ? documentChecklist
              : plan.logistics.documentChecklist,
          reservationTimeline:
            reservationTimeline.length > 0
              ? reservationTimeline
              : plan.logistics.reservationTimeline,
        },
      };
    }
    case "budget": {
      const breakdown = asArray<BudgetCategory>(data["breakdown"]);
      const dailyEstimates = asArray<DailyBudget>(data["dailyEstimates"]);
      const savingTips = asArray<string>(data["savingTips"]);
      return {
        ...plan,
        budget: {
          ...plan.budget,
          breakdown: breakdown.length > 0 ? breakdown : plan.budget.breakdown,
          dailyEstimates:
            dailyEstimates.length > 0
              ? dailyEstimates
              : plan.budget.dailyEstimates,
          totalEstimate:
            typeof data["totalEstimate"] === "number" &&
            (data["totalEstimate"] as number) > 0
              ? (data["totalEstimate"] as number)
              : plan.budget.totalEstimate,
          perPersonEstimate:
            typeof data["perPersonEstimate"] === "number" &&
            (data["perPersonEstimate"] as number) > 0
              ? (data["perPersonEstimate"] as number)
              : plan.budget.perPersonEstimate,
          currency:
            typeof data["currency"] === "string"
              ? (data["currency"] as string)
              : plan.budget.currency,
          savingTips: savingTips.length > 0 ? savingTips : plan.budget.savingTips,
        },
      };
    }
    case "weather": {
      const days = asArray<DayWeather>(data["days"]);
      return {
        ...plan,
        weather: days.length > 0 ? days : plan.weather,
      };
    }
    default: {
      const _x: never = section;
      void _x;
      return plan;
    }
  }
}

export const usePlanStore = create<PlanStoreState>()(
  persist(
    (set, get) => ({
      plans: {},
      plan: null,
      researchAgents: [],
      sliceStatus: {},
      generating: false,
      error: null,
      savePlan: (plan) =>
        set((state) => ({
          plans: { ...state.plans, [plan.id]: plan },
          plan,
        })),
      getPlan: (id) => get().plans[id],
      setPlan: (plan) => set({ plan }),
      setAgents: (researchAgents) => set({ researchAgents }),
      updateAgent: (id, patch) =>
        set((state) => ({
          researchAgents: state.researchAgents.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        })),
      setGenerating: (generating) => set({ generating }),
      setError: (error) => set({ error }),
      setSliceStatus: (planId, section, status) =>
        set((state) => ({
          sliceStatus: {
            ...state.sliceStatus,
            [planId]: {
              ...(state.sliceStatus[planId] ?? {}),
              [section]: status,
            },
          },
        })),
      mergePlanSlice: (planId, section, data) =>
        set((state) => {
          const existing = state.plans[planId];
          if (!existing) return state;
          const merged = mergeSliceIntoPlan(existing, section, data);
          const nextPartialAgents = (existing.partialAgents ?? []).filter(
            (a) => {
              // Map section -> agent id (for partialAgents bookkeeping)
              const map: Record<PlanSliceSection, string> = {
                hotels: "accommodation",
                restaurants: "restaurant",
                activities: "activity",
                logistics: "logistics",
                budget: "budget",
                weather: "weather",
              };
              return a !== map[section];
            },
          );
          const stillPartial = nextPartialAgents.length > 0;
          const finalPlan: TravelPlan = {
            ...merged,
            partialAgents: nextPartialAgents,
            partial: stillPartial,
          };
          return {
            plans: { ...state.plans, [planId]: finalPlan },
            plan: state.plan?.id === planId ? finalPlan : state.plan,
            sliceStatus: {
              ...state.sliceStatus,
              [planId]: {
                ...(state.sliceStatus[planId] ?? {}),
                [section]: "done" as PlanSliceStatus,
              },
            },
          };
        }),
      reset: () =>
        set({ plan: null, researchAgents: [], generating: false, error: null }),
      clearPlans: () => set({ plans: {}, plan: null, sliceStatus: {} }),
    }),
    {
      name: "voyari:plans",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      partialize: (state) => ({ plans: state.plans, plan: state.plan }) as Partial<PlanStoreState>,
      version: 1,
    },
  ),
);
