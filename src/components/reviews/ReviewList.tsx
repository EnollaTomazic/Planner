// src/components/reviews/ReviewList.tsx
"use client";
import "../reviews/style.css";

import * as React from "react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

type Props = {
  reviews: Review[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, nextTitle: string) => void; // kept for API stability; not used
  onDelete?: (id: string) => void;
  className?: string;
};

/**
 * ReviewList
 * - No inline edit
 * - Title + tiny date on same line
 * - Result-colored dot to the LEFT of the title
 * - Hover: only glow (no translate/scale/border-width change => no jump)
 */
export default function ReviewList({
  reviews,
  selectedId,
  onSelect,
  onDelete,
  className,
}: Props) {
  return (
    <div className={cn("reviews-scope space-y-2", className)}>
      {reviews.map((r) => {
        const active = r.id === selectedId;

        // Typed, no "any"
        const res: "Win" | "Loss" | undefined = r.result;
        const scoreNum = typeof r.score === "number" ? r.score : NaN;
        const scoreTxt = Number.isFinite(scoreNum) ? ` · ${scoreNum}/10` : "";

        const dateStr =
          typeof r.createdAt === "number"
            ? new Date(r.createdAt).toLocaleDateString()
            : "";

        const dotColor =
          res === "Win"
            ? "bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,.8)]"
            : res === "Loss"
            ? "bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,.8)]"
            : "bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,.5)]";

        const onTileKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") onSelect(r.id);
        };

        return (
          <div
            key={r.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(r.id)}
            onKeyDown={onTileKeyDown}
            className={cn(
              "group/review relative w-full rounded-2xl h-20 px-3 py-2",
              // constant border to prevent hover jump
              "border border-[hsl(var(--border)/.22)]",
              "bg-[hsl(var(--card))]",
              "transition-[box-shadow,background,border-color] duration-200",
              // glow only (no transform)
              "hover:border-[hsl(var(--border)/.45)] hover:shadow-[0_0_0_1px_hsl(var(--accent)/.25)_inset,0_10px_20px_hsl(var(--shadow-color)/.28)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
              active &&
                "shadow-[0_0_0_1px_hsl(var(--accent)/.35)_inset,0_12px_24px_hsl(var(--shadow-color)/.32)]"
            )}
            aria-current={active ? "true" : undefined}
          >
            <div className="grid h-full grid-cols-[1fr_auto] items-center gap-3">
              {/* Left info */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  {/* Status dot — blinks only when selected */}
                  <span
                    aria-hidden
                    className={cn(
                      "inline-block h-2.5 w-2.5 rounded-full",
                      active && "animate-pulse",
                      dotColor
                    )}
                  />
                  <div className="truncate font-medium leading-6">
                    {r.title || "Untitled review"}
                  </div>
                  {dateStr ? (
                    <div className="shrink-0 text-[10px] leading-none text-muted-foreground">
                      {dateStr}
                    </div>
                  ) : null}
                </div>
                <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {(r.opponent || "—") +
                    " · " +
                    (r.lane || "—") +
                    " · " +
                    (res ? (res === "Win" ? "W" : "L") : r.side || "—") +
                    scoreTxt}
                </div>
              </div>

              {/* Right controls — fixed width; circular icon button */}
              <div className="flex h-full w-10 items-center justify-end">
                {onDelete ? (
                  <button
                    type="button"
                    aria-label="Delete review"
                    title="Delete review"
                    className={cn(
                      "rounded-full h-8 w-8 flex items-center justify-center",
                      // constant border for no-jump + subtle bg
                      "border border-[hsl(var(--border)/.35)] bg-[hsl(var(--card))]",
                      "opacity-0 group-hover/review:opacity-100 group-focus-within/review:opacity-100",
                      "transition-[opacity,box-shadow,border-color,background] duration-200",
                      // glow only (no transform)
                      "hover:border-[hsl(var(--border)/.6)] hover:shadow-[0_6px_20px_hsl(var(--shadow-color)/.28),inset_0_0_0_1px_hsl(var(--accent)/.25)]"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(r.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
