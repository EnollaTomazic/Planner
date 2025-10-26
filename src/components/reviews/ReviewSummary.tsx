"use client";

import * as React from "react";
import type { Review, Role, ReviewMarker, Pillar } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SCORE_POOLS,
  FOCUS_POOLS,
  pickIndex,
  scoreIcon,
} from "@/components/reviews/reviewData";
import { SectionCard } from "@/components/ui/layout/SectionCard";
import { ReviewSummaryHeader } from "@/components/reviews/ReviewSummaryHeader";
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

  return (
    <SectionCard
      variant="plain"
      className={cn("transition-none shadow-none", className)}
    >
      <ReviewSummaryHeader title={laneTitle} role={role} result={result} onEdit={onEdit} />
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

