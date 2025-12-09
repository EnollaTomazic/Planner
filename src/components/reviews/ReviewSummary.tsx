"use client";

import * as React from "react";
import type { Review, Role, ReviewMarker, Pillar } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SCORE_POOLS,
  FOCUS_POOLS,
  ROLE_OPTIONS,
  pickIndex,
  scoreIcon,
} from "@/components/reviews/reviewData";
import { Hero } from "@/components/ui";
import { IconButton } from "@/components/ui/primitives/IconButton";
import { Pencil } from "lucide-react";
import { SectionCard } from "@/components/ui/layout/SectionCard";
import { ReviewSummaryScore } from "@/components/reviews/ReviewSummaryScore";
import { ReviewSummaryPillars } from "@/components/reviews/ReviewSummaryPillars";
import { ReviewSummaryTimestamps } from "@/components/reviews/ReviewSummaryTimestamps";
import { ReviewSummaryNotes } from "@/components/reviews/ReviewSummaryNotes";

type Props = {
  review: Review;
  onEdit?: () => void;
  className?: string;
};

export function ReviewSummary({ review, onEdit, className }: Props) {
  const role: Role | undefined = review.role as Role | undefined;
  const result: "Win" | "Loss" | undefined = review.result;
  const score = Number.isFinite(review.score) ? Number(review.score) : 5;
  const normalizedScore = Math.max(0, Math.min(10, Math.round(score)));
  const focusOn = Boolean(review.focusOn);
  const focus = Number.isFinite(review.focus) ? Number(review.focus) : 5;
  const normalizedFocus = Math.max(0, Math.min(10, Math.round(focus)));
  const markers: ReviewMarker[] = Array.isArray(review.markers) ? review.markers : [];
  const laneTitle = review.lane ?? review.title ?? "";

  const scorePool = SCORE_POOLS[normalizedScore] ?? SCORE_POOLS[5];
  const msgIndex = pickIndex(
    String(review.id ?? "seed") + normalizedScore,
    scorePool.length,
  );
  const msg = scorePool[msgIndex % scorePool.length];
  const { Icon: ScoreIcon, cls: scoreIconCls } = scoreIcon(normalizedScore);

  const focusPool = FOCUS_POOLS[normalizedFocus] ?? FOCUS_POOLS[5];
  const focusMsgIndex = pickIndex(
    String(review.id ?? "seed-focus") + normalizedFocus,
    focusPool.length,
  );
  const focusMsg = focusPool[focusMsgIndex % focusPool.length];

  const roleOption = ROLE_OPTIONS.find((r) => r.value === role);
  const RoleIcon = roleOption?.Icon;
  const roleLabel = roleOption?.label;

  const resultBadge = result && (
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

  const metaRow = roleLabel || resultBadge;
  const headerActions = onEdit ? (
    <IconButton
      variant="quiet"
      size="md"
      aria-label="Edit review"
      title="Edit review"
      onClick={onEdit}
    >
      <Pencil className="h-[var(--icon-size-sm)] w-[var(--icon-size-sm)]" />
    </IconButton>
  ) : null;

  return (
    <SectionCard
      depth="soft"
      variant="plain"
      className={cn("transition-none shadow-none", className)}
    >
      <Hero
        variant="panel"
        as="header"
        className="section-h sticky"
        title={laneTitle || "Untitled review"}
        subtitle={roleLabel}
        headingLevel={2}
        actions={headerActions}
        accent="accent"
      >
        {metaRow ? (
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            {roleLabel ? (
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
            {resultBadge}
          </div>
        ) : null}
      </Hero>
      <ReviewSummaryScore
        score={score}
        msg={msg}
        ScoreIcon={ScoreIcon}
        scoreIconCls={scoreIconCls}
        focusOn={focusOn}
        focus={focus}
        focusMsg={focusMsg}
      />
      <ReviewSummaryPillars pillars={review.pillars as Pillar[]} />
      <ReviewSummaryTimestamps markers={markers} />
      {review.notes ? <ReviewSummaryNotes notes={review.notes} /> : null}
    </SectionCard>
  );
}

