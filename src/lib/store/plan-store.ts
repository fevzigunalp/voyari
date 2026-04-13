"use client";

import { create } from "zustand";
import type { TravelPlan } from "@/lib/types/plan";
import type { ResearchAgentState } from "@/lib/types/research";

interface PlanStoreState {
  plan: TravelPlan | null;
  researchAgents: ResearchAgentState[];
  generating: boolean;
  error: string | null;
  setPlan: (plan: TravelPlan | null) => void;
  setAgents: (agents: ResearchAgentState[]) => void;
  updateAgent: (id: string, patch: Partial<ResearchAgentState>) => void;
  setGenerating: (flag: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePlanStore = create<PlanStoreState>((set) => ({
  plan: null,
  researchAgents: [],
  generating: false,
  error: null,
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
  reset: () =>
    set({ plan: null, researchAgents: [], generating: false, error: null }),
}));
