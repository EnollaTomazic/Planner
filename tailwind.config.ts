// Tailwind config — Lavender‑Glitch theme bindings
// - TypeScript config; works with Tailwind 3.4+
// - Dark mode by class; colors map to CSS variables in globals.css
import type { Config } from "tailwindcss";
import { spacingTokens, radiusTokens } from "./src/lib/tokens";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
        colors: {
          border: "var(--border)",
          input: "var(--input)",
          ring: "var(--ring)",
          background: "var(--background)",
          foreground: "var(--foreground)",
          card: { DEFAULT: "var(--card)" },
          panel: { DEFAULT: "var(--panel)" },
          primary: {
            DEFAULT: "var(--primary)",
            foreground: "var(--primary-foreground)",
            soft: "var(--primary-soft)",
          },
          accent: {
            DEFAULT: "var(--accent)",
            soft: "var(--accent-soft)",
          },
          "accent-2": "var(--accent-2)",
          glow: "var(--glow)",
          ringMuted: "var(--ring-muted)",
          danger: "var(--danger)",
          success: {
            DEFAULT: "var(--success)",
            glow: "var(--success-glow)",
          },
          auroraG: "var(--aurora-g)",
          auroraGLight: "var(--aurora-g-light)",
          auroraP: "var(--aurora-p)",
          auroraPLight: "var(--aurora-p-light)",
          muted: {
            DEFAULT: "var(--muted)",
            foreground: "var(--muted-foreground)",
          },
          lavDeep: "var(--lav-deep)",
          surfaceVhs: "var(--surface-vhs)",
          surfaceStreak: "var(--surface-streak)",
        },
      borderRadius: {
        md: `var(${radiusTokens[0]})`,
        lg: `var(${radiusTokens[1]})`,
        xl: `var(${radiusTokens[2]})`,
        "2xl": `var(${radiusTokens[3]})`,
      },
        boxShadow: {
          "neo-sm":
            "4px 4px 8px color-mix(in srgb, var(--panel) 72%, transparent), -4px -4px 8px color-mix(in srgb, var(--foreground) 6%, transparent)",
          neo:
            "12px 12px 24px color-mix(in srgb, var(--panel) 72%, transparent), -12px -12px 24px color-mix(in srgb, var(--foreground) 6%, transparent)",
          "neo-strong":
            "14px 14px 28px color-mix(in srgb, var(--panel) 72%, transparent), -14px -14px 28px color-mix(in srgb, var(--foreground) 6%, transparent)",
          "neo-inset":
            "inset 4px 4px 10px color-mix(in srgb, var(--panel) 85%, transparent), inset -4px -4px 10px color-mix(in srgb, var(--foreground) 8%, transparent)",
          ring: "0 0 12px var(--ring)",
          neoSoft: "0 3px 12px -4px var(--shadow-color)",
        },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        snap: "var(--ease-snap)",
      },
      transitionDuration: {
        140: "140ms",
        200: "200ms",
        220: "220ms",
        420: "420ms",
      },
      spacing: spacingTokens.reduce(
        (acc, token, idx) => {
          acc[idx + 1] = `${token}px`;
          return acc;
        },
        {} as Record<number, string>,
      ),
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 120ms linear",
      },
    },
  },
  plugins: [],
};

export default config;
