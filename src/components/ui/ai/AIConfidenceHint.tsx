"use client";

import * as React from "react";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

import { cn } from "@/lib/utils";

export type AIConfidenceLevel = "low" | "medium" | "high";

export interface AIConfidenceHintProps extends React.ComponentPropsWithoutRef<"div"> {
  readonly level: AIConfidenceLevel;
  readonly label?: string;
  readonly score?: number;
  readonly description?: string;
  readonly formatScore?: (score: number) => string;
}

type ConfidenceTone = "danger" | "warning" | "success";

const LEVEL_CONFIG: Record<
  AIConfidenceLevel,
  { label: string; tone: ConfidenceTone; icon: React.ReactNode }
> = {
  low: {
    label: "Low",
    tone: "danger",
    icon: <ShieldAlert aria-hidden className="size-[var(--space-4)]" />,
  },
  medium: {
    label: "Medium",
    tone: "warning",
    icon: <ShieldQuestion aria-hidden className="size-[var(--space-4)]" />,
  },
  high: {
    label: "High",
    tone: "success",
    icon: <ShieldCheck aria-hidden className="size-[var(--space-4)]" />,
  },
};

const toneBackground: Record<ConfidenceTone, string> = {
  danger: "bg-[hsl(var(--danger)/0.14)] border-[hsl(var(--danger)/0.35)]",
  warning: "bg-[hsl(var(--warning-soft-strong))] border-[hsl(var(--warning)/0.45)]",
  success: "bg-[hsl(var(--success-soft))] border-[hsl(var(--success)/0.35)]",
};

const toneForeground: Record<ConfidenceTone, string> = {
  danger: "text-[hsl(var(--danger-foreground))]",
  warning: "text-[hsl(var(--warning-foreground))]",
  success: "text-[hsl(var(--success-foreground))]",
};

const barTone: Record<ConfidenceTone, string> = {
  danger: "bg-[hsl(var(--danger))]",
  warning: "bg-[hsl(var(--warning))]",
  success: "bg-[hsl(var(--success))]",
};

const AIConfidenceHint = React.forwardRef<HTMLDivElement, AIConfidenceHintProps>(
  (
    {
      level,
      label = "Confidence",
      score,
      description,
      formatScore = defaultFormat,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const config = LEVEL_CONFIG[level];
    const scoreLabel = typeof score === "number" ? formatScore(score) : undefined;
    const normalizedScore =
      typeof score === "number" && !Number.isNaN(score)
        ? Math.min(1, Math.max(0, score))
        : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-[var(--space-2)] rounded-card border p-[var(--space-3)] shadow-[var(--shadow-outline-faint)]",
          toneBackground[config.tone],
          toneForeground[config.tone],
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-[var(--space-2)]">
          <span
            aria-hidden
            className={cn(
              "grid size-[var(--space-8)] shrink-0 place-items-center rounded-full bg-[hsl(var(--panel)/0.85)] text-[inherit] shadow-[var(--shadow-inset-hairline)]",
              toneForeground[config.tone],
            )}
          >
            {config.icon}
          </span>
          <div className="flex flex-1 flex-col gap-[var(--space-1-5)]">
            <div className="flex flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[var(--space-1)]">
              <p className="text-label font-medium tracking-[-0.01em]">{label}</p>
              <span className="text-caption font-semibold uppercase tracking-[0.08em] opacity-85">
                {config.label}
              </span>
              {scoreLabel ? <span className="text-caption opacity-85">{scoreLabel}</span> : null}
            </div>
            {description ? <p className="text-caption opacity-80">{description}</p> : null}
            {children}
          </div>
        </div>
        <div className="flex h-[var(--space-2)] items-center gap-[var(--space-1)]">
          {Array.from({ length: 5 }).map((_, index) => {
            const isActive = (() => {
              if (normalizedScore === undefined) {
                return index < (level === "low" ? 2 : level === "medium" ? 3 : 5);
              }
              const step = (index + 1) / 5;
              return normalizedScore >= step - 0.0001;
            })();

            return (
              <span
                key={index}
                aria-hidden
                className={cn(
                  "flex-1 rounded-full bg-[hsl(var(--muted)/0.6)]",
                  isActive ? barTone[config.tone] : "opacity-60",
                )}
              />
            );
          })}
        </div>
      </div>
    );
  },
);

AIConfidenceHint.displayName = "AIConfidenceHint";

function defaultFormat(score: number) {
  return `${Math.round(score * 100)}%`;
}

export { AIConfidenceHint };
