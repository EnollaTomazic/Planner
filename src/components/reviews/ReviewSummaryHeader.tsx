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
  const RoleIcon = role ? ROLE_OPTIONS.find((r) => r.value === role)?.Icon : undefined;
  const roleLabel = role ? ROLE_OPTIONS.find((r) => r.value === role)?.label : undefined;

  const ResultBadge =
    result && (
      <span
        className={cn(
          "inline-flex h-10 items-center rounded-2xl border px-3 text-sm font-semibold",
          "border-border bg-card",
          result === "Win"
            ? "shadow-[0_0_0_1px_hsl(var(--ring)/.35)_inset] bg-gradient-to-r from-success/20 to-accent/16"
            : "bg-gradient-to-r from-danger/18 to-primary/16",
        )}
        aria-label={`Result: ${result}`}
        title={`Result: ${result}`}
      >
        {result}
      </span>
    );

  return (
    <div className="section-h sticky">
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
        <div className="min-w-0">
          <div className="mb-1 text-xs text-foreground/25">Title</div>
          <div className="truncate text-lg font-medium leading-7 text-foreground/70">
            {title || "Untitled review"}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {role ? (
            <span
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-2xl border border-border",
                "bg-card px-3 text-sm font-semibold",
              )}
              title={roleLabel}
            >
              {RoleIcon ? <RoleIcon className="h-5 w-5" /> : null}
              {roleLabel}
            </span>
          ) : null}
          {ResultBadge}
          {onEdit ? (
            <IconButton
              variant="ring"
              size="md"
              aria-label="Edit review"
              title="Edit review"
              onClick={onEdit}
            >
              <Pencil className="h-5 w-5" />
            </IconButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

