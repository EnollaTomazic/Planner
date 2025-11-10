"use client";

import Link from "next/link";
import * as React from "react";

import { Card } from "./Card";
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
  type InsightTabKey = "activity" | "prompts" | "calendar";

  const [activeTab, setActiveTab] = React.useState<InsightTabKey>("activity");
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

  const insightTabs = React.useMemo(
    () =>
      [
        {
          key: "activity" as const,
          label: "Activity",
          render: () => <ActivityCard {...activity} />,
        },
        {
          key: "prompts" as const,
          label: "Prompts",
          render: () => <TeamPromptsCard />,
        },
        {
          key: "calendar" as const,
          label: "Calendar",
          render: () => (
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
          ),
        },
      ] satisfies readonly {
        key: InsightTabKey;
        label: string;
        render: () => React.ReactNode;
      }[],
    [activity, calendar.label, calendarSummary, days, handleSelectDay],
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
          <Card className={styles.overviewCard} noiseLevel="none">
            <Card.Header
              className={styles.overviewHeader}
              eyebrow={summary.label}
              title={summary.title}
              eyebrowClassName={styles.cardLabel}
              titleClassName={styles.cardTitle}
            />
            <Card.Body className="text-card-foreground">
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
            </Card.Body>
            <Card.Actions className={styles.cardActions}>
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
            </Card.Actions>
          </Card>
          <Card className={styles.overviewCard} noiseLevel="none">
            <Card.Header
              className={styles.overviewHeader}
              eyebrow={goals.label}
              title={goals.title}
              eyebrowClassName={styles.cardLabel}
              titleClassName={styles.cardTitle}
              description={`${goals.completed}/${goals.total} complete`}
              descriptionClassName={styles.cardHint}
            />
            <Card.Body className="text-card-foreground">
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
            </Card.Body>
          </Card>
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
            {insightTabs.map((tab) => {
              const tabId = `${tabBaseId}-tab-${tab.key}`;
              const panelId = `${tabBaseId}-panel-${tab.key}`;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  className={cn(styles.tabButton, isActive && styles.tabButtonActive)}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className={styles.tabPanels}>
            {insightTabs.map((tab) => {
              const panelId = `${tabBaseId}-panel-${tab.key}`;
              const tabId = `${tabBaseId}-tab-${tab.key}`;
              const isActive = activeTab === tab.key;
              return (
                <div
                  key={tab.key}
                  id={panelId}
                  role="tabpanel"
                  aria-labelledby={tabId}
                  hidden={!isActive}
                  className={styles.tabPanel}
                >
                  {isActive ? tab.render() : null}
                </div>
              );
            })}
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
