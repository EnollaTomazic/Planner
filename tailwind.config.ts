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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))" },
        panel: { DEFAULT: "hsl(var(--panel))" },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          soft: "hsl(var(--accent-soft))",
        },
        "accent-2": "hsl(var(--accent-2))",
        glow: "hsl(var(--glow))",
        ringMuted: "hsl(var(--ring-muted))",
        danger: "hsl(var(--danger))",
        success: {
          DEFAULT: "hsl(var(--success))",
          glow: "hsl(var(--success-glow))",
        },
        auroraG: "hsl(var(--aurora-g))",
        auroraGLight: "hsl(var(--aurora-g-light))",
        auroraP: "hsl(var(--aurora-p))",
        auroraPLight: "hsl(var(--aurora-p-light))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        lavDeep: "hsl(var(--lav-deep))",
        surfaceVhs: "hsl(var(--surface-vhs))",
        surfaceStreak: "hsl(var(--surface-streak))",
      },
      borderRadius: {
        md: `var(${radiusTokens[0]})`,
        lg: `var(${radiusTokens[1]})`,
        xl: `var(${radiusTokens[2]})`,
        "2xl": `var(${radiusTokens[3]})`,
      },
      boxShadow: {
        "neo-sm":
          "4px 4px 8px hsl(var(--panel)/0.72), -4px -4px 8px hsl(var(--foreground)/0.06)",
        neo: "12px 12px 24px hsl(var(--panel)/0.72), -12px -12px 24px hsl(var(--foreground)/0.06)",
        "neo-strong":
          "14px 14px 28px hsl(var(--panel)/0.72), -14px -14px 28px hsl(var(--foreground)/0.06)",
        "neo-inset":
          "inset 4px 4px 10px hsl(var(--panel)/0.85), inset -4px -4px 10px hsl(var(--foreground)/0.08)",
        ring: "0 0 12px hsl(var(--ring))",
        neoSoft: "0 3px 12px -4px hsl(var(--shadow-color))",
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
