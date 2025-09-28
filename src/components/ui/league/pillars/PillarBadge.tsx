// src/components/ui/PillarBadge.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import type { Pillar } from "@/lib/types";
import { Waves, HandCoins, Eye, Timer, Crosshair, MessagesSquare } from "lucide-react";
import styles from "./PillarBadge.module.css";

type Size = "sm" | "md" | "lg";
type AsTag = "button" | "span" | "div";

type Props = {
  pillar: Pillar;
  size?: Size;
  className?: string;
  withIcon?: boolean;
  /** If true, badge is clickable by default (unless you override `as`). */
  interactive?: boolean;
  /** Visual active state (drives gradient). */
  active?: boolean;
  /** Click handler. Works with `as="button"` or with role+tabIndex on non-buttons. */
  onClick?: () => void;
  /** Force the rendered element. Use `as="span"` inside a parent <button>. */
  as?: AsTag;
  /** Optional native title/disabled passthrough. */
  title?: string;
  disabled?: boolean;
};

/**
 * PillarBadge — Lavender-Glitch chip for pillar tags.
 *
 * Important:
 * - If you render this INSIDE another <button>, set `as="span"` here.
 *   HTML forbids <button> inside <button>, and React will warn during hydration.
 */
export default function PillarBadge({
  pillar,
  size = "md",
  className = "",
  withIcon = true,
  interactive = false,
  active = false,
  onClick,
  as,
  title,
  disabled,
}: Props) {
  const theme = PILLAR_THEME[pillar];
  const Icon = theme.icon;

  const sizeCls =
    size === "lg"
      ? "h-[var(--control-h-md)] px-[var(--space-4)] text-body gap-[var(--space-2)]"
      : size === "sm"
        ? "h-[var(--space-6)] px-[var(--space-3)] text-label gap-[var(--space-2)]"
        : "h-[var(--control-h-sm)] px-[var(--space-4)] text-ui gap-[var(--space-2)]";

  // Default element: "button" if interactive, else "span".
  const Tag: AsTag = as ?? (interactive ? "button" : "span");

  // Common class list
  const cls = clsx(styles.root, "rounded-full", sizeCls, className);

  // If not a real button but still clickable, apply minimal semantics
  const nonButtonInteractiveProps =
    Tag !== "button" && (interactive || onClick)
      ? { role: "button" as const, tabIndex: 0, onClick }
      : {};

  // Keyboard activate for non-button interactive usage
  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (!nonButtonInteractiveProps) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <Tag
      // Button-only attributes
      {...(Tag === "button"
        ? {
            type: "button",
            onClick,
            disabled,
            "aria-pressed": interactive ? active : undefined,
          }
        : {})}
      // Non-button semantics when clickable
      {...nonButtonInteractiveProps}
      onKeyDown={Tag === "button" ? undefined : onKeyDown}
      // Shared props
      className={cls}
      data-interactive={interactive ? "true" : undefined}
      data-selected={active ? "true" : undefined}
      data-pillar={pillar}
      title={title ?? pillar}
    >
      {withIcon && <Icon className={styles.icon} aria-hidden="true" />}
      <span className={styles.label}>{pillar}</span>
    </Tag>
  );
}

type PillarThemeEntry = {
  start: string;
  end: string;
  shadow: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const PILLAR_THEME: Record<Pillar, PillarThemeEntry> = {
  Wave: {
    start: "pillar-wave-start",
    end: "pillar-wave-end",
    shadow: "pillar-wave-shadow",
    icon: Waves,
  },
  Trading: {
    start: "pillar-trading-start",
    end: "pillar-trading-end",
    shadow: "pillar-trading-shadow",
    icon: HandCoins,
  },
  Vision: {
    start: "pillar-vision-start",
    end: "pillar-vision-end",
    shadow: "pillar-vision-shadow",
    icon: Eye,
  },
  Tempo: {
    start: "pillar-tempo-start",
    end: "pillar-tempo-end",
    shadow: "pillar-tempo-shadow",
    icon: Timer,
  },
  Positioning: {
    start: "pillar-positioning-start",
    end: "pillar-positioning-end",
    shadow: "pillar-positioning-shadow",
    icon: Crosshair,
  },
  Comms: {
    start: "pillar-comms-start",
    end: "pillar-comms-end",
    shadow: "pillar-comms-shadow",
    icon: MessagesSquare,
  },
};
