"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFocusDate } from "@/components/planner";
import { usePersistentState } from "@/lib/db";
import type { Review } from "@/lib/types";
import { CHAT_PROMPTS_STORAGE_KEY } from "@/components/prompts/useChatPrompts";
import type { Prompt } from "@/components/prompts/types";
import { useFocusDayLabel } from "./useHeroPlanner";

export type HeroSummaryItem = {
  key: "focus" | "reviews" | "prompts";
  label: string;
  value: string;
  href: string;
  cta: string;
};

export type HeroSummaryListProps = {
  items: readonly HeroSummaryItem[];
  className?: string;
};

type ReviewSummary = {
  reviewCount: number;
  flaggedCount: number;
};

type PromptSummary = {
  promptCount: number;
};

function useReviewSummary(): ReviewSummary {
  const [reviews] = usePersistentState<Review[]>("reviews.v1", []);
  return React.useMemo(() => {
    let flagged = 0;
    for (const review of reviews) {
      if (review.focusOn) flagged += 1;
    }
    return { reviewCount: reviews.length, flaggedCount: flagged };
  }, [reviews]);
}

function usePromptSummary(): PromptSummary {
  const [prompts] = usePersistentState<Prompt[]>(
    CHAT_PROMPTS_STORAGE_KEY,
    [],
  );
  return React.useMemo(
    () => ({ promptCount: prompts.length }),
    [prompts.length],
  );
}

export function useHeroSummaryItems(): readonly HeroSummaryItem[] {
  const { iso } = useFocusDate();
  const focusLabel = useFocusDayLabel(iso);
  const { reviewCount, flaggedCount } = useReviewSummary();
  const { promptCount } = usePromptSummary();

  return React.useMemo(() => {
    const reviewValue =
      flaggedCount > 0
        ? `${flaggedCount} review${flaggedCount === 1 ? "" : "s"}`
        : reviewCount > 0
          ? "All caught up"
          : "No reviews yet";
    const promptValue =
      promptCount > 0 ? `${promptCount} saved` : "Start a prompt";

    return [
      {
        key: "focus" as const,
        label: "Next focus",
        value: focusLabel,
        href: "/planner",
        cta: "Open planner",
      },
      {
        key: "reviews" as const,
        label: "Open reviews",
        value: reviewValue,
        href: "/reviews",
        cta: flaggedCount > 0 ? "Review now" : "View reviews",
      },
      {
        key: "prompts" as const,
        label: "Team prompts",
        value: promptValue,
        href: "/prompts",
        cta: promptCount > 0 ? "View prompts" : "Browse prompts",
      },
    ] as const;
  }, [flaggedCount, focusLabel, promptCount, reviewCount]);
}

function HeroSummaryList({ items, className }: HeroSummaryListProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-[var(--space-3)]",
        className,
      )}
    >
      <div className="space-y-[var(--space-1)]">
        <p className="text-label text-muted-foreground">Highlights</p>
        <h3 className="text-body font-semibold text-card-foreground tracking-[-0.01em]">
          Quick summary
        </h3>
      </div>
      <ul className="grid gap-[var(--space-2)]" role="list">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-[var(--space-3)] rounded-card r-card-md border border-border/60 bg-card/70 px-[var(--space-3)] py-[var(--space-2)] transition",
                "hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
              )}
            >
              <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                <span className="text-label text-muted-foreground">{item.label}</span>
                <span className="text-ui font-semibold text-card-foreground text-balance">
                  {item.value}
                </span>
              </div>
              <span className="shrink-0 text-label font-medium text-primary transition-colors group-hover:text-primary-foreground">
                {item.cta}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HeroSummaryList;
