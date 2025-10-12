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
  const focusOn = Boolean(review.focusOn);
  const focus = Number.isFinite(review.focus) ? Number(review.focus) : 5;
  const markers: ReviewMarker[] = Array.isArray(review.markers) ? review.markers : [];
  const laneTitle = review.lane ?? review.title ?? "";

  const msgIndex = pickIndex(String(review.id ?? "seed") + score, 5);
  const pool = SCORE_POOLS[score];
  const msg = pool[msgIndex];
  const { Icon: ScoreIcon, cls: scoreIconCls } = scoreIcon(score);

  const focusMsgIndex = pickIndex(String(review.id ?? "seed-focus") + focus, 10);
  const focusMsg = (FOCUS_POOLS[focus] ?? FOCUS_POOLS[5])[focusMsgIndex % 10];

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

