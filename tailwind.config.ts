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
        surface: "hsl(var(--surface))",
        "surface-alt": "hsl(var(--surface-alt))",
        text: "hsl(var(--text))",
        accent: "hsl(var(--accent))",
        "accent-strong": "hsl(var(--accent-strong))",
        "accent-weak": "hsl(var(--accent-weak))",
        "status-success": "hsl(var(--status-success))",
        "status-warning": "hsl(var(--status-warning))",
        "status-error": "hsl(var(--status-error))",
      },
      borderRadius: {
        md: `var(${radiusTokens[0]})`,
        lg: `var(${radiusTokens[1]})`,
        xl: `var(${radiusTokens[2]})`,
        "2xl": `var(${radiusTokens[3]})`,
      },
      boxShadow: {
        "neo-sm":
          "4px 4px 8px hsl(var(--surface-alt)/0.72), -4px -4px 8px hsl(var(--text)/0.06)",
        neo: "12px 12px 24px hsl(var(--surface-alt)/0.72), -12px -12px 24px hsl(var(--text)/0.06)",
        "neo-strong":
          "14px 14px 28px hsl(var(--surface-alt)/0.72), -14px -14px 28px hsl(var(--text)/0.06)",
        "neo-inset":
          "inset 4px 4px 10px hsl(var(--surface-alt)/0.85), inset -4px -4px 10px hsl(var(--text)/0.08)",
        ring: "0 0 12px hsl(var(--accent))",
        neoSoft: "0 3px 12px -4px hsl(var(--accent))",
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
