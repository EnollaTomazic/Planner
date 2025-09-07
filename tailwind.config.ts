// Tailwind config — Lavender‑Glitch theme bindings
// - TypeScript config; works with Tailwind 3.4+
// - Dark mode by class; colors map to CSS variables in globals.css
import type { Config } from "tailwindcss";

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
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))"
        },
        accent: { DEFAULT: "hsl(var(--accent))", soft: "hsl(var(--accent-soft))" },
        accent2: "hsl(var(--accent-2))",
        glow: "hsl(var(--glow))",
        ringMuted: "hsl(var(--ring-muted))",
        danger: "hsl(var(--danger))",
        success: {
          DEFAULT: "hsl(var(--success))",
          glow: "hsl(var(--success-glow))"
        },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        lavDeep: "hsl(var(--lav-deep))",
        surfaceVhs: "hsl(var(--surface-vhs))",
        surfaceStreak: "hsl(var(--surface-streak))"
      },
      borderRadius: { md: "8px", lg: "12px", xl: "16px", "2xl": "24px" },
      boxShadow: {
        "neo-sm":
          "4px 4px 8px hsl(var(--bg)/0.72), -4px -4px 8px hsl(var(--text)/0.06)",
        neo:
          "12px 12px 24px hsl(var(--bg)/0.72), -12px -12px 24px hsl(var(--text)/0.06)",
        "neo-strong":
          "14px 14px 28px hsl(var(--bg)/0.72), -14px -14px 28px hsl(var(--text)/0.06)",
        "neo-inset":
          "inset 4px 4px 10px hsl(var(--bg)/0.85), inset -4px -4px 10px hsl(var(--text)/0.08)",
        ring: "0 0 12px hsl(var(--ring))",
        neoSoft: "0 3px 12px -4px hsl(var(--shadow-color))"
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        snap: "var(--ease-snap)"
      },
      transitionDuration: { 140: "140ms", 200: "200ms", 220: "220ms", 420: "420ms" },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "24px",
        6: "32px",
        7: "48px",
        8: "64px"
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        shimmer: "shimmer 120ms linear"
      }
    }
  },
  plugins: []
};

export default config;
