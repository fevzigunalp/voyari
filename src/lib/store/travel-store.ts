"use client";

import { create } from "zustand";
import type { TravelerProfile } from "@/lib/types/traveler-profile";
import type { ResearchAgentId } from "@/lib/types/research";
import type { TravelPlan } from "@/lib/types/plan";

export type ResearchBundle = Partial<Record<ResearchAgentId, unknown>>;

interface TravelStoreState {
  profile: Partial<TravelerProfile>;
  research: ResearchBundle | null;
  plan: TravelPlan | null;
  setProfile: (patch: Partial<TravelerProfile>) => void;
  setResearch: (r: ResearchBundle) => void;
  updateResearchAgent: (id: ResearchAgentId, data: unknown) => void;
  setPlan: (p: TravelPlan) => void;
  resetProfile: () => void;
  resetAll: () => void;
}

export const useTravelStore = create<TravelStoreState>((set) => ({
  profile: {},
  research: null,
  plan: null,
  setProfile: (patch) =>
    set((state) => ({ profile: { ...state.profile, ...patch } })),
  setResearch: (r) => set({ research: r }),
  updateResearchAgent: (id, data) =>
    set((state) => ({
      research: { ...(state.research ?? {}), [id]: data },
    })),
  setPlan: (p) => set({ plan: p }),
  resetProfile: () => set({ profile: {} }),
  resetAll: () => set({ profile: {}, research: null, plan: null }),
}));
