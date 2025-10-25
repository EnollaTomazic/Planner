"use client";

import Link from "next/link";
import * as React from "react";

import { ActivityCard } from "./ActivityCard";
import { GoalsCard } from "./GoalsCard";
import { IsometricRoom } from "./IsometricRoom";
import type { PlannerOverviewProps } from "./home-landing";
import { QuickActions } from "./QuickActions";
import { TeamPromptsCard } from "./TeamPromptsCard";
import { TodayCard } from "./TodayCard";
import { DashboardList } from "./DashboardList";
import { Button } from "@/components/ui";
import { Progress } from "@/components/ui/feedback/Progress";
import { layoutGridClassName } from "@/components/ui/layout/PageShell";
import type { Variant } from "@/lib/theme";
import { cn, withBasePath } from "@/lib/utils";
import styles from "./HeroPlannerCards.module.css";

export interface HeroPlannerHighlight {
  id: string;
  title: string;
  schedule: string;
  summary: string;
}

export interface HeroPlannerCardsProps {
  variant: Variant;
  plannerOverviewProps: PlannerOverviewProps;
  highlights: readonly HeroPlannerHighlight[];
  className?: string;
}

const HeroPlannerCards = React.memo(function HeroPlannerCards({
  variant,
  plannerOverviewProps,
  highlights,
  className,
}: HeroPlannerCardsProps) {
  const { summary, goals, calendar, activity } = plannerOverviewProps;
  const { days, onSelectDay } = calendar;
  const [activeTab, setActiveTab] = React.useState<"activity" | "prompts" | "calendar">("activity");
  const tabBaseId = React.useId();

  const summaryItems = React.useMemo(() => {
    return new Map(summary.items.map((item) => [item.key, item]));
  }, [summary.items]);

  const upcomingItems = React.useMemo(
    () =>
      (['focus', 'reviews', 'prompts'] as const)
        .map((key) => summaryItems.get(key))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [summaryItems],
  );

  const calendarSummary = calendar.hasPlannedTasks
    ? `${calendar.doneCount}/${calendar.totalCount} tasks locked`
    : calendar.summary;

  const handleSelectDay = React.useCallback(
    (iso: string) => {
      onSelectDay(iso);
    },
    [onSelectDay],
  );

  return (
    <section className={cn(styles.root, className)}>
      <div
        className={cn(
          layoutGridClassName,
          styles.shell,
          "md:grid-cols-12 supports-[grid-template-columns:subgrid]:md:[grid-template-columns:subgrid]",
        )}
      >
        <div className={cn("col-span-full", styles.widgetRow)}>
          <div className={cn("md:col-span-6", styles.splitHalf)}>
            <div className={styles.section}>
              <p className={styles.sectionHeading}>Quick calibrations</p>
              <QuickActions />
            </div>
          </div>
          <div className={cn("md:col-span-6", styles.splitHalf)}>
            <div className={styles.section}>
              <p className={styles.sectionHeading}>Ambient room</p>
              <IsometricRoom variant={variant} />
            </div>
          </div>
        </div>
        <div className={cn("col-span-full", styles.overviewRow)}>
          <article className={styles.overviewCard}>
            <header className={styles.overviewHeader}>
              <p className={styles.cardLabel}>{summary.label}</p>
              <h3 className={styles.cardTitle}>{summary.title}</h3>
            </header>
            <ul className={styles.metricList} role="list">
              {upcomingItems.map((item) => (
                <li key={item.key} className={styles.metricItem}>
                  <Link
                    href={withBasePath(item.href, { skipForNextLink: true })}
                    className={styles.metricLink}
                  >
                    <span className={styles.metricLabel}>{item.label}</span>
                    <span className={styles.metricValue}>{item.value}</span>
                    <span className={styles.metricCta}>{item.cta}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className={styles.cardActions}>
              <Button
                asChild
                size="sm"
                variant="default"
                className={styles.primaryButton}
              >
                <Link href={withBasePath("/planner", { skipForNextLink: true })}>
                  Open planner
                </Link>
              </Button>
            </div>
          </article>
          <article className={styles.overviewCard}>
            <header className={styles.overviewHeader}>
              <p className={styles.cardLabel}>{goals.label}</p>
              <h3 className={styles.cardTitle}>{goals.title}</h3>
              <p className={styles.cardHint}>
                {goals.completed}/{goals.total} complete
              </p>
            </header>
            <div className={styles.progressBlock}>
              <Progress value={goals.percentage} label="Goals completion" />
              <span className={styles.progressValue}>{goals.percentage}%</span>
            </div>
            <div className={styles.goalList}>
              {goals.total === 0 ? (
                <p className={styles.emptyGoal}>{goals.emptyMessage}</p>
              ) : goals.active.length > 0 ? (
                goals.active.slice(0, 3).map((goal) => (
                  <div key={goal.id} className={styles.goalItem}>
                    <p className={styles.goalTitle}>{goal.title}</p>
                    {goal.detail ? (
                      <p className={styles.goalDetail}>{goal.detail}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className={styles.emptyGoal}>{goals.allCompleteMessage}</p>
              )}
            </div>
            <div className={styles.calendarStrip}>
              <div className={styles.calendarMeta}>
                <p className={styles.cardLabel}>{calendar.label}</p>
                <p className={styles.calendarSummary}>{calendarSummary}</p>
              </div>
              <ul className={styles.calendarDays} role="list">
                {days.map((day) => {
                  const blockInteraction = day.disabled || day.loading;
                  return (
                    <li key={day.iso}>
                      <button
                        type="button"
                        aria-pressed={day.selected}
                        aria-current={day.today ? "date" : undefined}
                        aria-disabled={blockInteraction || undefined}
                        aria-busy={day.loading || undefined}
                        disabled={day.disabled}
                        data-loading={day.loading ? "true" : undefined}
                        onClick={() => {
                          if (blockInteraction) return;
                          handleSelectDay(day.iso);
                        }}
                        className={cn(
                          styles.calendarDay,
                          day.today && styles.calendarDayToday,
                          day.selected && styles.calendarDaySelected,
                          day.disabled && styles.calendarDayDisabled,
                        )}
                      >
                        <span className={styles.calendarDayLabel}>{day.weekday}</span>
                        <span className={styles.calendarDayNumber}>{day.dayNumber}</span>
                        <span className={styles.calendarDayCount}>
                          {day.done}/{day.total}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className={styles.cardActions}>
              <Button
                asChild
                size="sm"
                variant="default"
                className={styles.primaryButton}
              >
                <Link href={withBasePath("/goals", { skipForNextLink: true })}>
                  Manage goals
                </Link>
              </Button>
            </div>
          </article>
        </div>
        <div className={cn("col-span-full", styles.miniGrid)}>
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Today focus</p>
            <TodayCard />
          </div>
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Goals pulse</p>
            <GoalsCard />
          </div>
          <div className={styles.section}>
            <p className={styles.sectionHeading}>Highlights</p>
            <DashboardList
              items={highlights}
              getKey={(highlight) => highlight.id}
              className={styles.highlightList}
              itemClassName={styles.highlightListItem}
              empty="No highlights"
              renderItem={(highlight) => (
                <article className={styles.highlightEntry}>
                  <header className={styles.highlightHeader}>
                    <p className={styles.highlightTitle}>{highlight.title}</p>
                    <p className={styles.highlightSchedule}>{highlight.schedule}</p>
                  </header>
                  <p className={styles.highlightSummary}>{highlight.summary}</p>
                </article>
              )}
            />
          </div>
        </div>
        <div className={cn("col-span-full", styles.tabPanelCard)}>
          <div className={styles.tabHeader} role="tablist" aria-label="Planner insights">
            {["activity", "prompts", "calendar"].map((key) => {
              const tabKey = key as "activity" | "prompts" | "calendar";
              const tabId = `${tabBaseId}-tab-${tabKey}`;
              const panelId = `${tabBaseId}-panel-${tabKey}`;
              return (
                <button
                  key={tabKey}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tabKey}
                  aria-controls={panelId}
                  className={cn(styles.tabButton, activeTab === tabKey && styles.tabButtonActive)}
                  onClick={() => setActiveTab(tabKey)}
                >
                  {tabKey === "activity"
                    ? "Activity"
                    : tabKey === "prompts"
                      ? "Prompts"
                      : "Calendar"}
                </button>
              );
            })}
          </div>
          <div className={styles.tabPanels}>
            <div
              id={`${tabBaseId}-panel-activity`}
              role="tabpanel"
              aria-labelledby={`${tabBaseId}-tab-activity`}
              hidden={activeTab !== "activity"}
              className={styles.tabPanel}
            >
              <ActivityCard {...activity} />
            </div>
            <div
              id={`${tabBaseId}-panel-prompts`}
              role="tabpanel"
              aria-labelledby={`${tabBaseId}-tab-prompts`}
              hidden={activeTab !== "prompts"}
              className={styles.tabPanel}
            >
              <TeamPromptsCard />
            </div>
            <div
              id={`${tabBaseId}-panel-calendar`}
              role="tabpanel"
              aria-labelledby={`${tabBaseId}-tab-calendar`}
              hidden={activeTab !== "calendar"}
              className={styles.tabPanel}
            >
              <div className={styles.calendarPanel}>
                <p className={styles.cardLabel}>{calendar.label}</p>
                <p className={styles.calendarSummary}>{calendarSummary}</p>
                <ul className={styles.calendarDays} role="list">
                  {days.map((day) => {
                    const blockInteraction = day.disabled || day.loading;
                    return (
                      <li key={day.iso}>
                        <button
                          type="button"
                          aria-pressed={day.selected}
                          aria-current={day.today ? "date" : undefined}
                          aria-disabled={blockInteraction || undefined}
                          aria-busy={day.loading || undefined}
                          disabled={day.disabled}
                          data-loading={day.loading ? "true" : undefined}
                          onClick={() => {
                            if (blockInteraction) return;
                            handleSelectDay(day.iso);
                          }}
                          className={cn(
                            styles.calendarDay,
                            day.today && styles.calendarDayToday,
                            day.selected && styles.calendarDaySelected,
                            day.disabled && styles.calendarDayDisabled,
                          )}
                        >
                          <span className={styles.calendarDayLabel}>{day.weekday}</span>
                          <span className={styles.calendarDayNumber}>{day.dayNumber}</span>
                          <span className={styles.calendarDayCount}>
                            {day.done}/{day.total}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-full">
          <div className={styles.aiPanel}>
            <div className={styles.aiHeader}>
              <span className={styles.aiChip}>AI draft</span>
              <p className={styles.aiCopy}>
                Agnes and Noxi surfaced three momentum bets. Everything stays editable, retryable, and dismissible.
              </p>
            </div>
            <div className={styles.aiActions}>
              <Button size="sm" variant="quiet" className={styles.secondaryButton}>
                Retry
              </Button>
              <Button size="sm" variant="default" className={styles.primaryButton}>
                Edit draft
              </Button>
              <Button size="sm" variant="quiet" className={styles.secondaryButton}>
                Cancel
              </Button>
            </div>
            <p className={styles.aiHint}>
              Confidence: medium. Suggestions will adapt once you complete today’s plan or dismiss items manually.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroPlannerCards.displayName = "HeroPlannerCards";
export { HeroPlannerCards };
