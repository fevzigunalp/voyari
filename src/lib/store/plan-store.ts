"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TravelPlan } from "@/lib/types/plan";
import type { ResearchAgentState } from "@/lib/types/research";

interface PlanStoreState {
  plans: Record<string, TravelPlan>;
  plan: TravelPlan | null;
  researchAgents: ResearchAgentState[];
  generating: boolean;
  error: string | null;
  savePlan: (plan: TravelPlan) => void;
  getPlan: (id: string) => TravelPlan | undefined;
  setPlan: (plan: TravelPlan | null) => void;
  setAgents: (agents: ResearchAgentState[]) => void;
  updateAgent: (id: string, patch: Partial<ResearchAgentState>) => void;
  setGenerating: (flag: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  clearPlans: () => void;
}

export const usePlanStore = create<PlanStoreState>()(
  persist(
    (set, get) => ({
      plans: {},
      plan: null,
      researchAgents: [],
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
      reset: () =>
        set({ plan: null, researchAgents: [], generating: false, error: null }),
      clearPlans: () => set({ plans: {}, plan: null }),
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
      partialize: (state) => ({ plans: state.plans, plan: state.plan }),
      version: 1,
    },
  ),
);
