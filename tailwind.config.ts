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
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--foreground))",
        },
        "surface-2": {
          DEFAULT: "hsl(var(--surface-2))",
          foreground: "hsl(var(--foreground))",
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
        "neo-sm": "var(--shadow-neo-sm)",
        neo: "var(--shadow-neo)",
        "neo-strong": "var(--shadow-neo-strong)",
        "neo-inset": "var(--shadow-neo-inset)",
        ring: "var(--shadow-ring)",
        neoSoft: "var(--shadow-neo-soft)",
        "glow-sm": "var(--shadow-glow-sm)",
        "glow-md": "var(--shadow-glow-md)",
        "glow-lg": "var(--shadow-glow-lg)",
        "glow-xl": "var(--shadow-glow-xl)",
        "nav-active": "var(--shadow-nav-active)",
        "outline-subtle": "var(--shadow-outline-subtle)",
        "outline-faint": "var(--shadow-outline-faint)",
        badge: "var(--shadow-badge)",
        dropdown: "var(--shadow-dropdown)",
        "inset-contrast": "var(--shadow-inset-contrast)",
        "inset-hairline": "var(--shadow-inset-hairline)",
        "glow-current": "var(--shadow-glow-current)",
        "btn-primary-hover": "var(--btn-primary-hover-shadow)",
        "btn-primary-active": "var(--btn-primary-active-shadow)",
        "neon-soft": "var(--shadow-neon-soft)",
        "neon-strong": "var(--shadow-neon-strong)",
        control: "var(--shadow-control)",
        "control-hover": "var(--shadow-control-hover)",
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
      fontSize: {
        label: ["var(--font-label)", { lineHeight: "1.2" }],
        ui: ["var(--font-ui)", { lineHeight: "1.35" }],
        body: ["var(--font-body)", { lineHeight: "1.6" }],
        title: ["var(--font-title)", { lineHeight: "1.25" }],
        "title-lg": ["var(--font-title-lg)", { lineHeight: "1.2" }],
      },
    },
  },
  plugins: [],
};

export default config;
