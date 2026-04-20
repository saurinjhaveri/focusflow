"use client";

import { create } from "zustand";
import type { ParsedTask } from "@/types";

interface CaptureState {
  rawInput: string;
  parsedPreview: ParsedTask | null;
  isCapturing: boolean;
  isParsing: boolean;

  setRawInput: (input: string) => void;
  setParsedPreview: (task: ParsedTask | null) => void;
  setIsCapturing: (val: boolean) => void;
  setIsParsing: (val: boolean) => void;
  reset: () => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  rawInput: "",
  parsedPreview: null,
  isCapturing: false,
  isParsing: false,

  setRawInput: (input) => set({ rawInput: input }),
  setParsedPreview: (task) => set({ parsedPreview: task }),
  setIsCapturing: (val) => set({ isCapturing: val }),
  setIsParsing: (val) => set({ isParsing: val }),
  reset: () =>
    set({
      rawInput: "",
      parsedPreview: null,
      isCapturing: false,
      isParsing: false,
    }),
}));
