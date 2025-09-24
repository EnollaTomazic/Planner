// Tailwind config — Lavender‑Glitch theme bindings
// - TypeScript config; works with Tailwind 3.4+
// - Dark mode by class; colors map to CSS variables in globals.css
import type { Config } from "tailwindcss";
import { spacingTokens, radiusScale } from "./src/lib/tokens";
import { tailwindColorPalette } from "./src/lib/theme/colors";

const progressWidthSafelist = Array.from({ length: 101 }, (_, index) => `w-[${index}%]`);

const borderRadiusTokens = Object.entries(radiusScale).reduce(
  (acc, [token, value]) => {
    acc[token] = `${value}px`;
    return acc;
  },
  {} as Record<string, string>,
);

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  safelist: progressWidthSafelist,
  theme: {
    extend: {
      colors: tailwindColorPalette,
      borderColor: {
        "card-hairline": "var(--card-hairline)",
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
