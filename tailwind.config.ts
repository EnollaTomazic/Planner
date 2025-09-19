// Tailwind config — Lavender‑Glitch theme bindings
// - TypeScript config; works with Tailwind 3.4+
// - Dark mode by class; colors map to CSS variables in globals.css
import type { Config } from "tailwindcss";
import { spacingTokens, radiusScale } from "./src/lib/tokens";

const borderRadiusTokens = Object.entries(radiusScale).reduce(
  (acc, [token, value]) => {
    acc[token] = `${value}px`;
    return acc;
  },
  {} as Record<string, string>,
);

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        panel: { DEFAULT: "hsl(var(--panel))" },
        "card-hairline": "hsl(var(--card-hairline))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
        },
        "accent-3": {
          DEFAULT: "hsl(var(--accent-3))",
        },
        "accent-2": {
          DEFAULT: "hsl(var(--accent-2))",
          foreground: "hsl(var(--accent-2-foreground))",
        },
        glow: "hsl(var(--glow))",
        "ring-muted": "hsl(var(--ring-muted))",
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          soft: "hsl(var(--warning-soft))",
          "soft-strong": "hsl(var(--warning-soft-strong))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          glow: "hsl(var(--success-glow))",
          soft: "hsl(var(--success-soft))",
        },
        "aurora-g": "hsl(var(--aurora-g))",
        "aurora-g-light": "hsl(var(--aurora-g-light))",
        "aurora-p": "hsl(var(--aurora-p))",
        "aurora-p-light": "hsl(var(--aurora-p-light))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        "lav-deep": "hsl(var(--lav-deep))",
        "surface-vhs": "hsl(var(--surface-vhs))",
        "surface-streak": "hsl(var(--surface-streak))",
        interaction: {
          primary: {
            hover: "hsl(var(--accent) / 0.14)",
            active: "hsl(var(--accent) / 0.2)",
          },
          accent: {
            hover: "hsl(var(--accent) / 0.14)",
            active: "hsl(var(--accent) / 0.2)",
            surfaceHover: "hsl(var(--accent) / 0.25)",
            surfaceActive: "hsl(var(--accent) / 0.35)",
            tintHover: "hsl(var(--accent) / 0.1)",
            tintActive: "hsl(var(--accent) / 0.2)",
          },
          info: {
            hover: "hsl(var(--accent-2) / 0.14)",
            active: "hsl(var(--accent-2) / 0.2)",
            surfaceHover: "hsl(var(--accent-2) / 0.25)",
            surfaceActive: "hsl(var(--accent-2) / 0.35)",
            tintHover: "hsl(var(--accent-2) / 0.1)",
            tintActive: "hsl(var(--accent-2) / 0.2)",
          },
          danger: {
            hover: "hsl(var(--danger) / 0.14)",
            active: "hsl(var(--danger) / 0.2)",
            surfaceHover: "hsl(var(--danger) / 0.12)",
            surfaceActive: "hsl(var(--danger) / 0.1)",
            tintHover: "hsl(var(--danger) / 0.1)",
            tintActive: "hsl(var(--danger) / 0.2)",
          },
          foreground: {
            tintHover: "hsl(var(--foreground) / 0.1)",
            tintActive: "hsl(var(--foreground) / 0.2)",
          },
        },
      },
      borderRadius: borderRadiusTokens,
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
        "glow-sm": "0 0 8px var(--glow-active)",
        "glow-md": "0 0 16px var(--glow-active)",
        "glow-lg": "0 0 20px var(--glow-active)",
        "glow-xl": "0 8px 22px var(--glow-active)",
        "nav-active":
          "0 0 0 1px hsl(var(--ring)/0.35), 0 8px 24px hsl(var(--ring)/0.2)",
        "outline-subtle": "0 0 0 1px hsl(var(--border)/0.12)",
        "outline-faint": "0 0 0 1px hsl(var(--border)/0.08)",
        badge:
          "inset 0 1px 0 hsl(var(--foreground)/0.06), 0 0 0 0.5px hsl(var(--card-hairline)/0.35), 0 10px 20px hsl(var(--shadow-color)/0.18)",
        "inset-contrast": "inset 0 0 0 1px var(--ring-contrast)",
        "inset-hairline": "inset 0 0 0 1px hsl(var(--card-hairline))",
        "glow-current": "0 0 8px currentColor",
        "btn-primary-hover": "var(--btn-primary-hover-shadow)",
        "btn-primary-active": "var(--btn-primary-active-shadow)",
        "neon-soft": "0 0 8px var(--neon), 0 0 16px var(--neon-soft)",
        "neon-strong": "0 0 12px var(--neon), 0 0 24px var(--neon-soft)",
        control: "inset 0 2px 4px 0 rgb(0 0 0 / 0.06), 0 0 0 1px hsl(var(--border)/0.12)",
        "control-hover": "0 2px 4px hsl(var(--shadow)/0.3)",
      },
      transitionTimingFunction: {
        standard: "var(--motion-easing-standard)",
        entrance: "var(--motion-easing-entrance)",
        exit: "var(--motion-easing-exit)",
      },
      transitionDuration: {
        100: "var(--motion-duration-100)",
        200: "var(--motion-duration-200)",
        300: "var(--motion-duration-300)",
        500: "var(--motion-duration-500)",
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
        shimmer: "shimmer var(--motion-duration-500) linear",
      },
      fontSize: {
        label: "var(--font-label)",
        ui: "var(--font-ui)",
        body: "var(--font-body)",
        title: "var(--font-title)",
        "title-lg": "var(--font-title-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
