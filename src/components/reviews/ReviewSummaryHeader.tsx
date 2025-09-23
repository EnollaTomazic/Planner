"use client";

import * as React from "react";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import IconButton from "@/components/ui/primitives/IconButton";
import { Pencil } from "lucide-react";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";

export type ReviewSummaryHeaderProps = {
  title: string;
  role?: Role;
  result?: "Win" | "Loss";
  onEdit?: () => void;
};

export default function ReviewSummaryHeader({
  title,
  role,
  result,
  onEdit,
}: ReviewSummaryHeaderProps) {
  const RoleIcon = role
    ? ROLE_OPTIONS.find((r) => r.value === role)?.Icon
    : undefined;
  const roleLabel = role
    ? ROLE_OPTIONS.find((r) => r.value === role)?.label
    : undefined;

  const ResultBadge = result && (
    <span
      className={cn(
        "inline-flex h-[var(--control-h-md)] items-center rounded-card r-card-lg border px-[var(--space-3)] text-ui font-medium",
        "border-border bg-card",
        result === "Win"
          ? "shadow-[0_0_0_var(--hairline-w)_hsl(var(--ring)/.35)_inset] [background-image:var(--review-result-win-gradient)]"
          : "[background-image:var(--review-result-loss-gradient)]",
      )}
      aria-label={`Result: ${result}`}
      title={`Result: ${result}`}
    >
      {result}
    </span>
  );

  return (
    <div className="section-h sticky">
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-[var(--space-4)]">
        <div className="min-w-0">
          <div className="mb-[var(--space-1)] text-ui font-medium tracking-[0.02em] text-foreground/60">Title</div>
          <div className="truncate text-title font-semibold tracking-[-0.01em] text-foreground/70">
            {title || "Untitled review"}
          </div>
        </div>
        <div className="flex items-center justify-end gap-[var(--space-2)]">
          {role ? (
            <span
              className={cn(
                "inline-flex h-[var(--control-h-md)] items-center gap-[var(--space-2)] rounded-card r-card-lg border border-border",
                "bg-card px-[var(--space-3)] text-ui font-medium",
              )}
              title={roleLabel}
            >
              {RoleIcon ? (
                <RoleIcon className="h-[var(--icon-size-sm)] w-[var(--icon-size-sm)]" />
              ) : null}
              {roleLabel}
            </span>
          ) : null}
          {ResultBadge}
          {onEdit ? (
            <IconButton
              variant="ghost"
              size="md"
              aria-label="Edit review"
              title="Edit review"
              onClick={onEdit}
            >
              <Pencil className="h-[var(--icon-size-sm)] w-[var(--icon-size-sm)]" />
            </IconButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
