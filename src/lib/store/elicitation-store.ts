"use client";

import { create } from "zustand";
import type { QuestionId } from "@/lib/types/questions";

interface ElicitationStoreState {
  currentIndex: number;
  history: QuestionId[];
  answers: Record<string, unknown>;
  setAnswer: (id: QuestionId, value: unknown) => void;
  goNext: () => void;
  goBack: () => void;
  setHistory: (history: QuestionId[]) => void;
  reset: () => void;
}

export const useElicitationStore = create<ElicitationStoreState>((set) => ({
  currentIndex: 0,
  history: [],
  answers: {},
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
  reset: () => set({ currentIndex: 0, history: [], answers: {} }),
}));
