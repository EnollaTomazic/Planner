// Tailwind config — Lavender‑Glitch theme bindings
// - TypeScript config; works with Tailwind 3.4+
// - Dark mode by class; colors map to CSS variables in globals.css
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tokenPlugin from "./scripts/tailwind-token-plugin";

const tokenThemeExtend =
  (tokenPlugin as unknown as {
    config?: { theme?: { extend?: Record<string, unknown> } };
  }).config?.theme?.extend ?? {};

const plannerSurfaces = plugin(({ addUtilities }) => {
  addUtilities({
    ".surface-card-soft": {
      background: "var(--surface-card-soft)",
    },
    ".surface-card-strong": {
      background: "var(--surface-card-strong)",
    },
    ".surface-rail-accent": {
      background: "var(--surface-rail-accent)",
    },
  });
});

const progressWidthValues: Record<string, string> = Object.fromEntries(
  Array.from({ length: 101 }, (_, index) => [`${index}`, `${index}%`]),
);

progressWidthValues.fill = "var(--progress)";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  safelist: [
    {
      pattern: /^progress-(?:[0-9]{1,2}|100|fill)$/,
    },
  ],
  theme: {
    extend: {
      ...tokenThemeExtend,
      borderColor: {
        "card-hairline": "var(--card-hairline)",
      },
      boxShadow: {
        "depth-outer": "var(--depth-shadow-outer)",
        "depth-outer-strong": "var(--depth-shadow-outer-strong)",
        "depth-soft": "var(--depth-shadow-soft)",
        "depth-inner": "var(--depth-shadow-inner)",
        "neo-sm": "var(--shadow-neo-sm)",
        neo: "var(--depth-shadow-outer, var(--shadow-neo))",
        "neo-strong": "var(--depth-shadow-outer-strong, var(--shadow-neo-strong))",
        "neo-inset": "var(--depth-shadow-inner, var(--shadow-neo-inset))",
        "neo-soft": "var(--depth-shadow-soft, var(--shadow-neo-soft))",
        "inner-sm": "var(--shadow-inner-sm)",
        "inner-md": "var(--shadow-inner-md)",
        "inner-lg": "var(--shadow-inner-lg)",
        "outer-sm": "var(--shadow-outer-sm)",
        "outer-md": "var(--shadow-outer-md)",
        "outer-lg": "var(--shadow-outer-lg)",
        ring: "var(--shadow-ring)",
        neoSoft: "var(--depth-shadow-soft, var(--shadow-neo-soft))",
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
        "elev-0": "var(--elevation-0)",
        "elev-1": "var(--elevation-1)",
        "elev-2": "var(--elevation-2)",
        "elev-3": "var(--elevation-3)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        snap: "var(--motion-ease-glitch, var(--ease-motion-glitch))",
        "motion-glitch": "var(--motion-ease-glitch)",
      },
      transitionDuration: {
        140: "140ms",
        200: "200ms",
        220: "220ms",
        420: "420ms",
        quick: "var(--motion-duration-sm, var(--dur-quick))",
        chill: "var(--motion-duration-md, var(--dur-chill))",
        slow: "var(--motion-duration-lg, var(--dur-slow))",
        "motion-sm": "var(--motion-duration-sm)",
        "motion-md": "var(--motion-duration-md)",
        "motion-lg": "var(--motion-duration-lg)",
      },
      opacity: {
        disabled: "var(--disabled)",
        loading: "var(--loading)",
      },
      backgroundImage: {
        "blob-primary":
          "radial-gradient(1200px 700px at 18% -10%, hsl(var(--backdrop-blob-1) / 0.16), transparent 60%), radial-gradient(1100px 600px at 110% 18%, hsl(var(--backdrop-blob-2) / 0.14), transparent 60%), radial-gradient(900px 480px at 50% 120%, hsl(var(--backdrop-blob-3) / 0.1), transparent 65%)",
        "gradient-blob-primary": "var(--gradient-blob-primary)",
        "drip-overlay": "var(--gradient-drip-overlay)",
        "drip-overlay-compact": "var(--gradient-drip-overlay-compact)",
        "glitch-primary": "var(--gradient-glitch-primary)",
        "glitch-overlay": "var(--gradient-glitch-overlay)",
        "glitch-rail": "var(--gradient-glitch-rail)",
        "hero-slot-highlight": "var(--gradient-hero-slot-highlight)",
        "hero-slot-shadow": "var(--gradient-hero-slot-shadow)",
        "hero-topline": "var(--gradient-hero-topline)",
        "hero-action-halo": "var(--gradient-hero-action-halo)",
        "panel-tilt-strong": "var(--gradient-panel-tilt-strong)",
        "panel-tilt-bright": "var(--gradient-panel-tilt-bright)",
        "panel-tilt-muted": "var(--gradient-panel-tilt-muted)",
        "glitch-noise":
          "var(--glitch-noise-image, var(--asset-noise-url, url(\"/noise.svg\")))",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        blobDrift: {
          "0%": {
            transform: "translate3d(0, 0, 0) scale3d(1, 1, 1)",
          },
          "50%": {
            transform:
              "translate3d(calc(var(--space-2) * -0.5), calc(var(--space-2) * -0.75), 0) scale3d(1.05, 1.05, 1)",
          },
          "100%": {
            transform: "translate3d(0, 0, 0) scale3d(1, 1, 1)",
          },
        },
        glitchNoise: {
          "0%": {
            opacity: "calc(var(--glitch-noise-level, 0.18) * 0.6)",
          },
          "50%": {
            opacity: "var(--glitch-noise-level, 0.18)",
          },
          "100%": {
            opacity: "calc(var(--glitch-noise-level, 0.18) * 0.6)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 120ms linear",
        "blob-drift":
          "blobDrift var(--blob-drift-duration, 28s) ease-in-out infinite",
        "glitch-noise":
          "glitchNoise var(--glitch-duration, 450ms) steps(2, end) infinite",
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
  plugins: [
    plannerSurfaces,
    tokenPlugin,
    plugin(({ matchUtilities }) => {
      matchUtilities(
        {
          progress: (value) => ({ "--progress-width": value, width: value }),
        },
        { values: progressWidthValues },
      );
    }),
  ],
};

export default config;
