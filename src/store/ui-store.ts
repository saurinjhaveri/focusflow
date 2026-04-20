"use client";

import { create } from "zustand";
import type { ViewMode, TaskFilters } from "@/types";

interface UIState {
  activeView: ViewMode;
  openTaskId: string | null;
  filters: TaskFilters;
  showFollowUpsPanel: boolean;

  setActiveView: (view: ViewMode) => void;
  setOpenTaskId: (id: string | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  toggleFollowUpsPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: "today",
  openTaskId: null,
  filters: {},
  showFollowUpsPanel: false,

  setActiveView: (view) => set({ activeView: view }),
  setOpenTaskId: (id) => set({ openTaskId: id }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
  toggleFollowUpsPanel: () =>
    set((state) => ({ showFollowUpsPanel: !state.showFollowUpsPanel })),
}));
