import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--c-primary)",
        "primary-deep": "var(--c-primary-deep)",
        "primary-soft": "var(--c-primary-soft)",
        accent: "var(--c-accent)",
        pink: "var(--c-pink)",
        mint: "var(--c-mint)",
        coral: "var(--c-coral)",
        sky: "var(--c-sky)",
        bg: "var(--c-bg)",
        surface: "var(--c-surface)",
        ink: "var(--c-ink)",
        "ink-soft": "var(--c-ink-soft)",
        line: "var(--c-line)"
      },
      borderRadius: {
        aibdSm: "var(--r-sm)",
        aibdMd: "var(--r-md)",
        aibdLg: "var(--r-lg)",
        aibdXl: "var(--r-xl)",
        pill: "var(--r-pill)"
      },
      boxShadow: {
        card: "var(--sh-card)",
        pop: "var(--sh-pop)",
        cta: "var(--sh-cta)"
      },
      fontFamily: {
        display: ["var(--font-display-cn)", "var(--font-display-en)"],
        displayEn: ["var(--font-display-en)"],
        body: ["var(--font-body-cn)", "var(--font-body-en)"],
        mono: ["var(--font-mono)"]
      }
    }
  },
  plugins: []
};

export default config;
