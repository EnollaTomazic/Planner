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
          "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          result === "Win"
            ? "shadow-[0_0_0_1px_hsl(var(--ring)/.35)_inset] bg-[linear-gradient(90deg,hsla(160,90%,45%,.20),hsla(190,90%,60%,.16))]"
            : "bg-[linear-gradient(90deg,hsla(0,90%,55%,.18),hsla(320,90%,65%,.16))]",
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
          <div className="mb-1 text-xs text-[hsl(var(--foreground)/0.25)]">Title</div>
          <div className="truncate text-lg font-medium leading-7 text-[hsl(var(--foreground)/0.7)]">
            {title || "Untitled review"}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          {role ? (
            <span
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-2xl border border-[hsl(var(--border))]",
                "bg-[hsl(var(--card))] px-3 text-sm font-semibold",
              )}
              title={roleLabel}
            >
              {RoleIcon ? <RoleIcon className="h-5 w-5" aria-hidden="true" /> : null}
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
              <Pencil className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

