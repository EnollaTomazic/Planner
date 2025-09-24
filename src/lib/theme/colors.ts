const cardHairlineOpacity = (percent: number) =>
  `color-mix(in oklab, var(--card-hairline) ${percent}%, transparent)`;

export const tailwindColorPalette = {
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
  "card-hairline": "var(--card-hairline)",
  "card-hairline-60": cardHairlineOpacity(60),
  "card-hairline-70": cardHairlineOpacity(70),
  "card-hairline-90": cardHairlineOpacity(90),
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
  },
  success: {
    DEFAULT: "hsl(var(--success))",
    glow: "hsl(var(--success-glow))",
    soft: "hsl(var(--success-soft))",
  },
  tone: {
    top: "hsl(var(--tone-top))",
    jg: "hsl(var(--tone-jg))",
    mid: "hsl(var(--tone-mid))",
    bot: "hsl(var(--tone-bot))",
    sup: "hsl(var(--tone-sup))",
  },
  "aurora-g": "hsl(var(--aurora-g))",
  "aurora-g-light": "var(--aurora-g-light)",
  "aurora-p": "hsl(var(--aurora-p))",
  "aurora-p-light": "var(--aurora-p-light)",
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
} as const;

export type TailwindColorPalette = typeof tailwindColorPalette;
