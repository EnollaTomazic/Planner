import { cn } from "@/lib/utils";

export type RadioIconGroupTone =
  | "accent"
  | "primary"
  | "success"
  | "warning"
  | "danger";

type ToneStyles = {
  surface: string;
  text: string;
  ring: string;
  glow: string;
  lift: string;
};

const baseLift = cn(
  "motion-safe:group-hover/radio:-translate-y-[calc(var(--space-1)/2)]",
  "motion-safe:group-active/radio:translate-y-[calc(var(--space-1)/4)]",
  "motion-reduce:transform-none",
);

export const radioIconGroupToneClasses: Record<RadioIconGroupTone, ToneStyles> = {
  accent: {
    surface: cn(
      "group-hover/radio:bg-accent/12",
      "group-active/radio:bg-accent/18",
      "peer-checked:border-accent/45",
      "peer-checked:bg-accent/18",
      "peer-checked:text-accent-foreground",
    ),
    text: "peer-checked:text-accent-foreground",
    ring: "peer-focus-visible:ring-accent",
    glow: "[--radio-glow:var(--accent-overlay)]",
    lift: baseLift,
  },
  primary: {
    surface: cn(
      "group-hover/radio:bg-primary/12",
      "group-active/radio:bg-primary/18",
      "peer-checked:border-primary/45",
      "peer-checked:bg-primary/18",
      "peer-checked:text-primary-foreground",
    ),
    text: "peer-checked:text-primary-foreground",
    ring: "peer-focus-visible:ring-primary",
    glow: "[--radio-glow:var(--glow-primary)]",
    lift: baseLift,
  },
  success: {
    surface: cn(
      "group-hover/radio:bg-success/12",
      "group-active/radio:bg-success/18",
      "peer-checked:border-success/45",
      "peer-checked:bg-success/18",
      "peer-checked:text-success-foreground",
    ),
    text: "peer-checked:text-success-foreground",
    ring: "peer-focus-visible:ring-success",
    glow: "[--radio-glow:hsl(var(--success-glow))]",
    lift: baseLift,
  },
  warning: {
    surface: cn(
      "group-hover/radio:bg-warning/14",
      "group-active/radio:bg-warning/18",
      "peer-checked:border-warning/45",
      "peer-checked:bg-warning/18",
      "peer-checked:text-warning-foreground",
    ),
    text: "peer-checked:text-warning-foreground",
    ring: "peer-focus-visible:ring-warning",
    glow: "[--radio-glow:hsl(var(--warning-soft-strong))]",
    lift: baseLift,
  },
  danger: {
    surface: cn(
      "group-hover/radio:bg-danger/12",
      "group-active/radio:bg-danger/18",
      "peer-checked:border-danger/45",
      "peer-checked:bg-danger/18",
      "peer-checked:text-danger-foreground",
    ),
    text: "peer-checked:text-danger-foreground",
    ring: "peer-focus-visible:ring-danger",
    glow: "[--radio-glow:hsl(var(--danger) / 0.45)]",
    lift: baseLift,
  },
};

export type RadioIconGroupToneStyles = typeof radioIconGroupToneClasses;
