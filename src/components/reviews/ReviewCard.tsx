"use client";
import "../reviews/style.css";

import type { Review } from "@/lib/types";
import { cn, LOCALE } from "@/lib/utils";
import Pill from "@/components/ui/primitives/pill";
import IconButton from "@/components/ui/primitives/IconButton";
import { Pencil } from "lucide-react";

export default function ReviewCard({
  review,
  active,
  onRenameStart,
}: {
  review: Review;
  active: boolean;
  onRenameStart: () => void;
}) {
  const created = review.createdAt ? new Date(review.createdAt) : null;

  return (
    <div className={cn("p-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/85", active && "shadow-lg")}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn("truncate font-semibold", active && "title-glow")}>{review.title || "Untitled Review"}</h3>
            <IconButton
              aria-label="Rename"
              circleSize="sm"
              iconSize="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRenameStart();
              }}
            >
              <Pencil />
            </IconButton>
          </div>

          <div className="mt-1 text-xs text-muted-foreground grid grid-cols-2 gap-2">
            <span>Opponent: {review.opponent || "—"}</span>
            <span>Lane: {review.lane || "—"}</span>
            <span>Side: {review.side || "—"}</span>
            <span>Patch: {review.patch || "—"}</span>
            <span>Duration: {review.duration || "—"}</span>
            <span>{created ? created.toLocaleDateString(LOCALE) : "—"}</span>
          </div>

          {Array.isArray(review.tags) && review.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {review.tags.slice(0, 6).map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
              {review.tags.length > 6 && <Pill>+{review.tags.length - 6}</Pill>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
