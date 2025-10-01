// Tailwind config — Lavender‑Glitch theme bindings
// - TypeScript config; works with Tailwind 3.4+
// - Dark mode by class; colors map to CSS variables in globals.css
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { spacingTokens, radiusScale } from "./src/lib/tokens";

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

const borderRadiusTokens = Object.entries(radiusScale).reduce(
  (acc, [token, value]) => {
    acc[token] = `${value}px`;
    return acc;
  },
  {} as Record<string, string>,
);

const cardHairlineOpacity = (percent: number) =>
  `hsl(var(--border) / ${percent / 100})`;

const progressWidthValues: Record<string, string> = Object.fromEntries(
  Array.from({ length: 101 }, (_, index) => [`${index}`, `${index}%`]),
);

progressWidthValues.fill = "var(--progress)";

const spacingScale = spacingTokens.reduce(
  (acc, token, index) => {
    const step = `${index + 1}`;
    acc[step] = `${token}px`;
    acc[`space-${step}`] = `var(--space-${step})`;
    return acc;
  },
  {} as Record<string, string>,
);

const fractionalSpacing: Record<string, string> = {
  "spacing-0-125": "var(--spacing-0-125)",
  "spacing-0-25": "var(--spacing-0-25)",
  "spacing-0-5": "var(--spacing-0-5)",
  "spacing-0-75": "var(--spacing-0-75)",
};

const extendedSpaceAliases: Record<string, string> = {
  "space-9": "var(--space-9)",
  "space-10": "var(--space-10)",
  "space-11": "var(--space-11)",
  "space-12": "var(--space-12)",
  "space-16": "var(--space-16)",
};

const spacingScaleWithAliases = {
  ...spacingScale,
  ...fractionalSpacing,
  ...extendedSpaceAliases,
};

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
      colors: {
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
        },
        input: "hsl(var(--input))",
        ring: {
          DEFAULT: "hsl(var(--ring))",
          contrast: "var(--ring-contrast)",
        },
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
        "surface-muted": "hsl(var(--surface-muted))",
        "surface-hover": "hsl(var(--surface-hover))",
        "surface-2": {
          DEFAULT: "hsl(var(--surface-2))",
          foreground: "hsl(var(--foreground))",
        },
        panel: { DEFAULT: "hsl(var(--panel))" },
        "card-hairline": {
          DEFAULT: "var(--card-hairline)",
          40: cardHairlineOpacity(40),
          45: cardHairlineOpacity(45),
          55: cardHairlineOpacity(55),
          60: cardHairlineOpacity(60),
          65: cardHairlineOpacity(65),
          70: cardHairlineOpacity(70),
          75: cardHairlineOpacity(75),
          90: cardHairlineOpacity(90),
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
          overlay: "var(--accent-overlay)",
        },
        on: {
          accent: "var(--text-on-accent)",
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
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          glow: "hsl(var(--success-glow))",
          soft: "hsl(var(--success-soft))",
          foreground: "hsl(var(--success-foreground))",
        },
        tone: {
          top: "hsl(var(--tone-top))",
          jg: "hsl(var(--tone-jg))",
          mid: "hsl(var(--tone-mid))",
          bot: "hsl(var(--tone-bot))",
          sup: "hsl(var(--tone-sup))",
        },
        "aurora-g": "hsl(var(--aurora-g))",
        "aurora-g-light":
          "var(--aurora-g-light-color, hsl(var(--aurora-g-light)))",
        "aurora-p": "hsl(var(--aurora-p))",
        "aurora-p-light":
          "var(--aurora-p-light-color, hsl(var(--aurora-p-light)))",
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
          focus: {
            hover: "hsl(var(--focus) / 0.14)",
            active: "hsl(var(--focus) / 0.2)",
            surfaceHover: "hsl(var(--focus) / 0.25)",
            surfaceActive: "hsl(var(--focus) / 0.35)",
            tintHover: "hsl(var(--focus) / 0.1)",
            tintActive: "hsl(var(--focus) / 0.2)",
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
      borderColor: {
        "card-hairline": "var(--card-hairline)",
      },
      borderRadius: borderRadiusTokens,
      boxShadow: {
        "neo-sm": "var(--shadow-neo-sm)",
        neo: "var(--shadow-neo)",
        "neo-strong": "var(--shadow-neo-strong)",
        "neo-inset": "var(--shadow-neo-inset)",
        "inner-sm": "var(--shadow-inner-sm)",
        "inner-md": "var(--shadow-inner-md)",
        "inner-lg": "var(--shadow-inner-lg)",
        "outer-sm": "var(--shadow-outer-sm)",
        "outer-md": "var(--shadow-outer-md)",
        "outer-lg": "var(--shadow-outer-lg)",
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
        "elev-0": "var(--elevation-0)",
        "elev-1": "var(--elevation-1)",
        "elev-2": "var(--elevation-2)",
        "elev-3": "var(--elevation-3)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        snap: "var(--ease-snap)",
      },
      transitionDuration: {
        140: "140ms",
        200: "200ms",
        220: "220ms",
        420: "420ms",
        quick: "var(--dur-quick)",
        chill: "var(--dur-chill)",
        slow: "var(--dur-slow)",
      },
      spacing: spacingScaleWithAliases,
      opacity: {
        disabled: "var(--disabled)",
        loading: "var(--loading)",
      },
      backgroundImage: {
        "blob-primary": "var(--gradient-blob-primary)",
        "glitch-primary": "var(--gradient-glitch-primary)",
        "shell-card": "var(--gradient-shell-card)",
        "shell-card-strong": "var(--gradient-shell-card-strong)",
        "shell-card-soft": "var(--gradient-shell-card-soft)",
        "shell-bloom": "var(--gradient-shell-bloom)",
        "shell-veil": "var(--gradient-shell-veil)",
        "shell-spotlight": "var(--gradient-shell-spotlight)",
        "shell-divider": "var(--gradient-shell-divider)",
        "hero-frame": "var(--gradient-hero-frame)",
        "drip-overlay": "var(--gradient-drip-overlay)",
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
