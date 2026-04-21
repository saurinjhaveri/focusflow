export const THEMES = {
  teal: {
    label: "Teal",
    description: "Calm & focused",
    swatches: ["#0D9488", "#14B8A6", "#EA580C"],
  },
  ocean: {
    label: "Ocean",
    description: "Clear & trustworthy",
    swatches: ["#2563EB", "#3B82F6", "#059669"],
  },
  ember: {
    label: "Ember",
    description: "Warm & creative",
    swatches: ["#7C3AED", "#8B5CF6", "#EA580C"],
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeKey = "teal";
export const THEME_STORAGE_KEY = "focusflow-theme";
