export const THEMES = ["purple", "orange", "green"] as const;

export type ThemeName = (typeof THEMES)[number];
export type ThemeVariables = Record<`--${string}`, string>;

export const THEME_VARIABLES: Record<ThemeName, ThemeVariables> = {
  purple: {
    "--c-primary": "#6C5CE7",
    "--c-primary-deep": "#4A3BC7",
    "--c-primary-soft": "#EDE8FF",
    "--c-primary-ink": "#2B1F6E",
    "--c-accent": "#FFD60A",
    "--c-pink": "#FF6B9D",
    "--c-mint": "#00D4AA",
    "--c-coral": "#FF8A65",
    "--c-sky": "#54C7FF",
    "--c-bg": "#F4F1FF",
    "--c-bg-deep": "#ECE6FF",
    "--c-surface": "#FFFFFF",
    "--c-surface-soft": "#FAFAFE",
    "--c-overlay": "rgba(26, 19, 64, 0.55)",
    "--c-ink": "#1A1340",
    "--c-ink-soft": "#5B5582",
    "--c-ink-muted": "#9890B5",
    "--c-ink-faint": "#C8C4DB",
    "--c-line": "#E8E3F8",
    "--c-success": "#00D4AA",
    "--c-warning": "#FFB020",
    "--c-danger": "#FF5A6F",
    "--c-streak": "#FF7849"
  },
  orange: {
    "--c-primary": "#FF7849",
    "--c-primary-deep": "#E55A2B",
    "--c-primary-soft": "#FFE8DE",
    "--c-primary-ink": "#7A2E10",
    "--c-accent": "#FFCB3E",
    "--c-pink": "#FF4F8B",
    "--c-mint": "#4ECDC4",
    "--c-coral": "#FF8A65",
    "--c-sky": "#4FB8FF",
    "--c-bg": "#FFF6EE",
    "--c-bg-deep": "#FFEADB",
    "--c-surface": "#FFFFFF",
    "--c-surface-soft": "#FFFBF6",
    "--c-overlay": "rgba(60, 20, 5, 0.55)",
    "--c-ink": "#2A1505",
    "--c-ink-soft": "#6B4530",
    "--c-ink-muted": "#A48A78",
    "--c-ink-faint": "#D7C5B6",
    "--c-line": "#F4E2D2",
    "--c-success": "#2ECC71",
    "--c-warning": "#FFB020",
    "--c-danger": "#E63946",
    "--c-streak": "#FF4F4F"
  },
  green: {
    "--c-primary": "#2ECC71",
    "--c-primary-deep": "#1F9D58",
    "--c-primary-soft": "#DCFCE7",
    "--c-primary-ink": "#0E4D24",
    "--c-accent": "#FFE066",
    "--c-pink": "#E84393",
    "--c-mint": "#4ECDC4",
    "--c-coral": "#FF8A65",
    "--c-sky": "#4FB8FF",
    "--c-bg": "#F1FBF4",
    "--c-bg-deep": "#DEF6E5",
    "--c-surface": "#FFFFFF",
    "--c-surface-soft": "#F6FBF7",
    "--c-overlay": "rgba(8, 40, 18, 0.55)",
    "--c-ink": "#0D2818",
    "--c-ink-soft": "#355040",
    "--c-ink-muted": "#80958A",
    "--c-ink-faint": "#C2D4C7",
    "--c-line": "#DDEDE2",
    "--c-success": "#2ECC71",
    "--c-warning": "#FFB020",
    "--c-danger": "#FF5A6F",
    "--c-streak": "#FF7849"
  }
};

export function getThemeVariables(theme: ThemeName): ThemeVariables {
  return THEME_VARIABLES[theme];
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
