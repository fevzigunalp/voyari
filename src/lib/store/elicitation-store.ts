"use client";

import { create } from "zustand";
import type { QuestionId } from "@/lib/types/questions";
import type { ExtractedIntent } from "@/lib/ai/schema";
import type {
  AccommodationValue,
  BudgetValue,
  DateRangeValue,
  DepartureValue,
  DestinationValue,
  FoodValue,
  PaceValue,
  TransportValue,
  TravelersValue,
} from "@/components/elicitation/questions/types";
import type {
  AccommodationType,
  BudgetLevel,
  FoodStyle,
  PaceType,
  TransportType,
  TravelerGroup,
} from "@/lib/types/traveler-profile";

interface ElicitationStoreState {
  currentIndex: number;
  history: QuestionId[];
  answers: Record<string, unknown>;
  prefilledKeys: QuestionId[];
  setAnswer: (id: QuestionId, value: unknown) => void;
  goNext: () => void;
  goBack: () => void;
  setHistory: (history: QuestionId[]) => void;
  setCurrentIndex: (index: number) => void;
  hydrateFromIntent: (intent: ExtractedIntent) => void;
  seedFromCollection: (
    seedAnswers: Partial<Record<string, unknown>>,
    options?: { overwrite?: boolean },
  ) => void;
  reset: () => void;
}

function diffDays(start: string, end: string): number {
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return 0;
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1);
}

export const useElicitationStore = create<ElicitationStoreState>((set) => ({
  currentIndex: 0,
  history: [],
  answers: {},
  prefilledKeys: [],
  setAnswer: (id, value) =>
    set((state) => ({ answers: { ...state.answers, [id]: value } })),
  goNext: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.history.length),
    })),
  goBack: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),
  setHistory: (history) => set({ history }),
  setCurrentIndex: (index) => set({ currentIndex: Math.max(0, index) }),
  hydrateFromIntent: (intent) =>
    set((state) => {
      const next: Record<string, unknown> = { ...state.answers };
      const prefilled: QuestionId[] = [...state.prefilledKeys];
      const claim = (id: QuestionId, value: unknown) => {
        if (next[id] !== undefined) return; // don't overwrite user input
        next[id] = value;
        if (!prefilled.includes(id)) prefilled.push(id);
      };

      if (intent.destinationQuery) {
        const v: DestinationValue = {
          query: intent.destinationQuery,
          flexible: false,
        };
        claim("destination", v);
      }
      if (intent.departureQuery) {
        const v: DepartureValue = { query: intent.departureQuery };
        claim("departure", v);
      }

      if (intent.startDate && intent.endDate) {
        const total =
          intent.totalDays && intent.totalDays > 0
            ? intent.totalDays
            : diffDays(intent.startDate, intent.endDate);
        const v: DateRangeValue = {
          startDate: intent.startDate,
          endDate: intent.endDate,
          totalDays: total,
        };
        claim("dates", v);
      }

      if (
        (intent.travelersAdults && intent.travelersAdults > 0) ||
        (intent.travelersChildren && intent.travelersChildren > 0) ||
        intent.travelerType
      ) {
        const adults =
          intent.travelersAdults && intent.travelersAdults > 0
            ? intent.travelersAdults
            : 2;
        const children =
          intent.travelersChildren && intent.travelersChildren > 0
            ? intent.travelersChildren
            : 0;
        const type: TravelerGroup =
          intent.travelerType ??
          (children > 0
            ? "family"
            : adults === 1
              ? "solo"
              : adults === 2
                ? "couple"
                : "friends");
        const v: TravelersValue = {
          adults,
          children,
          childAges: [],
          type,
        };
        claim("travelers", v);
      }

      if (intent.transportType) {
        const v: TransportValue = {
          type: intent.transportType as TransportType,
        };
        claim("transport", v);
      }

      if (intent.budgetLevel) {
        const v: BudgetValue = {
          level: intent.budgetLevel as BudgetLevel,
          currency: "EUR",
        };
        claim("budget", v);
      }

      if (intent.accommodationType) {
        const v: AccommodationValue = {
          type: intent.accommodationType as AccommodationType,
          priorities: [],
        };
        claim("accommodation", v);
      }

      if (intent.interestKeywords && intent.interestKeywords.length > 0) {
        // Legacy string[] form is still accepted by normalize/toInterestsValue.
        claim("interests", intent.interestKeywords);
      }

      if (intent.pace) {
        const v: PaceValue = { pace: intent.pace as PaceType };
        claim("pace", v);
      }

      if (intent.foodStyle) {
        const v: FoodValue = {
          style: intent.foodStyle as FoodStyle,
          restrictions: [],
        };
        claim("food", v);
      }

      if (intent.notes && intent.notes.trim().length > 0) {
        claim("specialRequests", intent.notes.trim());
      }

      return { answers: next, prefilledKeys: prefilled };
    }),
  seedFromCollection: (seedAnswers, options) =>
    set((state) => {
      const overwrite = options?.overwrite ?? false;
      const next: Record<string, unknown> = { ...state.answers };
      const prefilled: QuestionId[] = [...state.prefilledKeys];
      const claim = (id: QuestionId, value: unknown) => {
        if (!overwrite && next[id] !== undefined) return;
        next[id] = value;
        if (!prefilled.includes(id)) prefilled.push(id);
      };

      const raw = seedAnswers as Record<string, unknown>;

      if (typeof raw.transport === "string") {
        const v: TransportValue = { type: raw.transport as TransportType };
        claim("transport", v);
      }
      if (typeof raw.budget === "string") {
        const v: BudgetValue = {
          level: raw.budget as BudgetLevel,
          currency: "EUR",
        };
        claim("budget", v);
      }
      if (typeof raw.accommodation === "string") {
        const v: AccommodationValue = {
          type: raw.accommodation as AccommodationType,
          priorities: [],
        };
        claim("accommodation", v);
      }
      if (typeof raw.pace === "string") {
        const v: PaceValue = { pace: raw.pace as PaceType };
        claim("pace", v);
      }
      if (typeof raw.food === "string") {
        const v: FoodValue = {
          style: raw.food as FoodStyle,
          restrictions: [],
        };
        claim("food", v);
      }

      // Pass through any other explicit answer values (already-shaped)
      for (const [key, value] of Object.entries(raw)) {
        if (["transport", "budget", "accommodation", "pace", "food"].includes(key))
          continue;
        if (value === undefined) continue;
        claim(key as QuestionId, value);
      }

      return { answers: next, prefilledKeys: prefilled };
    }),
  reset: () =>
    set({ currentIndex: 0, history: [], answers: {}, prefilledKeys: [] }),
}));
