"use client";

import * as React from "react";
import DashboardCard from "./DashboardCard";
import { Button } from "@/components/ui";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import { cn } from "@/lib/utils";
import TeamQuickActions from "@/components/team/TeamQuickActions";
import styles from "./TeamPromptsCard.module.css";

const teamQuickActions = [
  {
    id: "team-archetypes",
    href: "/team?tab=cheat&sub=sheet",
    label: "Archetypes",
    asChild: true,
  },
  {
    id: "team-builder",
    href: "/team?tab=builder",
    label: "Team Builder",
    asChild: true,
  },
  {
    id: "team-jungle-clears",
    href: "/team?tab=clears",
    label: "Jungle Clears",
    asChild: true,
  },
];

export default function TeamPromptsCard() {
  const suggestions = React.useMemo(
    () => [
      {
        id: "weekly-sync",
        status: "draft" as const,
        title: "Weekly retro thread",
        summary: "Draft recap ready for review. Add match clips before sending.",
        confidence: 0.78,
      },
      {
        id: "focus-updates",
        status: "loading" as const,
        title: "Loading new scrim prompts",
      },
      {
        id: "risk-check",
        status: "error" as const,
        title: "Goal alignment fetch failed",
        message: "Vector index timed out. Retry or adjust filters.",
      },
      {
        id: "empty-state",
        status: "empty" as const,
        title: "No new prompts yet",
        message: "Agnes will surface ideas once the team shares more notes.",
      },
    ],
    [],
  );

  return (
    <div className={cn(layoutGridClassName, styles.root, "md:grid-cols-12")}>
      <div className={cn("md:col-span-6", styles.column)}>
        <DashboardCard title="Team quick actions">
          <TeamQuickActions actions={teamQuickActions} />
        </DashboardCard>
      </div>
      <div className={cn("md:col-span-6", styles.column)}>
        <DashboardCard
          title="Prompts cockpit"
          cta={{ label: "Explore Prompts", href: "/prompts" }}
        >
          <div className={styles.stack}>
            {suggestions.map((suggestion) => {
              if (suggestion.status === "draft") {
                return (
                  <article key={suggestion.id} className={cn(styles.suggestion, styles.draft)}>
                    <header className={styles.suggestionHeader}>
                      <span className={styles.statusChip}>AI draft</span>
                      <span className={styles.confidence}>
                        Confidence {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </header>
                    <div className={styles.body}>
                      <p className={styles.title}>{suggestion.title}</p>
                      <p className={styles.summary}>{suggestion.summary}</p>
                    </div>
                    <footer className={styles.actions}>
                      <Button size="sm" variant="ghost" tone="accent">
                        Retry
                      </Button>
                      <Button size="sm" variant="default" tone="accent">
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost">
                        Dismiss
                      </Button>
                    </footer>
                  </article>
                );
              }

              if (suggestion.status === "loading") {
                return (
                  <article key={suggestion.id} className={cn(styles.suggestion, styles.loading)} aria-live="polite">
                    <span className={styles.statusChip}>Loading draft</span>
                    <div className={styles.loadingBar} />
                    <p className={styles.summary}>{suggestion.title}</p>
                  </article>
                );
              }

              if (suggestion.status === "error") {
                return (
                  <article key={suggestion.id} className={cn(styles.suggestion, styles.error)} aria-live="assertive">
                    <span className={styles.statusChip}>Error</span>
                    <p className={styles.title}>{suggestion.title}</p>
                    <p className={styles.summary}>{suggestion.message}</p>
                    <footer className={styles.actions}>
                      <Button size="sm" variant="default" tone="accent">
                        Retry
                      </Button>
                      <Button size="sm" variant="ghost">
                        Cancel
                      </Button>
                    </footer>
                  </article>
                );
              }

              return (
                <article key={suggestion.id} className={cn(styles.suggestion, styles.empty)} aria-live="polite">
                  <span className={styles.statusChip}>Empty</span>
                  <p className={styles.title}>{suggestion.title}</p>
                  <p className={styles.summary}>{suggestion.message}</p>
                  <footer className={styles.actions}>
                    <Button size="sm" variant="default" tone="info">
                      Add note
                    </Button>
                  </footer>
                </article>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
