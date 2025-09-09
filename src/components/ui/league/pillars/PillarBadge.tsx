// src/components/ui/PillarBadge.tsx
"use client";

import * as React from "react";
import type { Pillar } from "@/lib/types";
import { Waves, HandCoins, Eye, Timer, Crosshair, MessagesSquare } from "lucide-react";

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
      ? "h-10 px-4 text-base gap-2"
      : size === "sm"
      ? "h-8 px-3 text-xs gap-2"
      : "h-9 px-4 text-sm gap-2";

  // Default element: "button" if interactive, else "span".
  const Tag: AsTag = as ?? (interactive ? "button" : "span");

  // Common class list
  const cls = [
    "lg-pillar-badge rounded-full",
    sizeCls,
    interactive ? "cursor-pointer select-none" : "",
    active ? "active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Shared inline CSS variables for gradient + shadow per pillar
  const style = {
    "--g1": theme.g1,
    "--g2": theme.g2,
    "--shadow": theme.shadow,
  } as React.CSSProperties;

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
      style={style}
      data-interactive={interactive ? "true" : undefined}
      data-selected={active ? "true" : undefined}
      title={title ?? pillar}
    >
      {withIcon && <Icon className="icon" aria-hidden="true" />}
      <span className="label">{pillar}</span>

      <style jsx>{`
        .lg-pillar-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          line-height: 1;
          font-weight: 600;

          background: hsl(var(--card) / 0.75);
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          box-shadow: 0 10px 30px hsl(var(--shadow-color) / 0.18);
          transition: box-shadow 160ms ease, background-color 160ms ease, color 160ms ease;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        /* Hover = shadow only, no translate */
        .lg-pillar-badge:hover,
        .lg-pillar-badge:focus-visible {
          box-shadow: 0 14px 36px hsl(var(--shadow-color) / 0.22);
          outline: none;
        }

        /* Active: gradient fill + border */
        .lg-pillar-badge.active {
          color: hsl(var(--primary-foreground));
          background: linear-gradient(
            90deg,
            color-mix(in oklab, var(--g1), transparent 82%),
            color-mix(in oklab, var(--g2), transparent 82%)
          );
          border-color: transparent;
          box-shadow: 0 0 0 1px hsl(var(--ring) / 0.28), 0 16px 40px hsl(var(--shadow-color) / 0.28);
        }
        .lg-pillar-badge.active::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--g1), var(--g2));
          -webkit-mask:
            linear-gradient(hsl(var(--foreground)) 0 0) content-box,
            linear-gradient(hsl(var(--foreground)) 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .lg-pillar-badge .icon {
          width: 1rem;
          height: 1rem;
          opacity: 0.95;
        }
        .lg-pillar-badge .label {
          position: relative;
          z-index: 1;
          letter-spacing: 0.2px;
          text-shadow: 0 1px 0 hsl(var(--shadow-color) / 0.05);
        }

        @media (prefers-reduced-motion: reduce) {
          .lg-pillar-badge {
            transition: none;
          }
        }
      `}</style>
    </Tag>
  );
}

const PILLAR_THEME: Record<
  Pillar,
  { g1: string; g2: string; shadow: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
> = {
  Wave: { g1: "hsla(257, 90%, 70%, 1)", g2: "hsla(198, 90%, 62%, 1)", shadow: "hsla(258, 90%, 38%, 0.35)", icon: Waves },
  Trading: { g1: "hsla(292, 85%, 72%, 1)", g2: "hsla(6, 85%, 66%, 1)", shadow: "hsla(292, 85%, 38%, 0.35)", icon: HandCoins },
  Vision: { g1: "hsla(157, 70%, 55%, 1)", g2: "hsla(192, 75%, 60%, 1)", shadow: "hsla(170, 70%, 30%, 0.35)", icon: Eye },
  Tempo: { g1: "hsla(260, 85%, 70%, 1)", g2: "hsla(280, 85%, 65%, 1)", shadow: "hsla(270, 80%, 35%, 0.35)", icon: Timer },
  Positioning: { g1: "hsla(190, 90%, 66%, 1)", g2: "hsla(220, 90%, 66%, 1)", shadow: "hsla(205, 85%, 35%, 0.35)", icon: Crosshair },
  Comms: { g1: "hsla(40, 95%, 62%, 1)", g2: "hsla(18, 90%, 60%, 1)", shadow: "hsla(28, 90%, 35%, 0.35)", icon: MessagesSquare },
};
