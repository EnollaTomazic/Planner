"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/primitives/Card";
import { Button } from "@/components/ui";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import { cn, withBasePath } from "@/lib/utils";
import { TeamQuickActions } from "@/components/team/TeamQuickActions";
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

export function TeamPromptsCard() {
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
        <Card>
          <CardHeader className="space-y-[var(--space-2)]">
            <h3 className="text-body font-semibold text-card-foreground">
              Team quick actions
            </h3>
          </CardHeader>
          <CardBody className="text-card-foreground">
            <TeamQuickActions actions={teamQuickActions} />
          </CardBody>
        </Card>
      </div>
      <div className={cn("md:col-span-6", styles.column)}>
        <Card>
          <CardHeader className="space-y-[var(--space-2)]">
            <h3 className="text-body font-semibold text-card-foreground">
              Prompts cockpit
            </h3>
          </CardHeader>
          <CardBody className={cn(styles.stack, "text-card-foreground")}>
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
                      <Button size="sm" variant="quiet" tone="accent">
                        Retry
                      </Button>
                      <Button size="sm" variant="default" tone="accent">
                        Edit
                      </Button>
                      <Button size="sm" variant="quiet">
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
                      <Button size="sm" variant="quiet">
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
          </CardBody>
          <CardFooter className="flex justify-end border-t border-card-hairline/60 text-card-foreground">
            <Button asChild size="sm" variant="default">
              <Link href={withBasePath("/prompts", { skipForNextLink: true })}>
                Explore Prompts
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
