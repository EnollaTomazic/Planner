"use client";

import Link from "next/link";
import * as React from "react";

import { Card, CardBody, CardHeader } from "@/components/ui/primitives/Card";
import { ActivityCard } from "./ActivityCard";
import { GoalsCard } from "./GoalsCard";
import { IsometricRoom } from "./IsometricRoom";
import type { PlannerOverviewProps } from "./home-landing";
import { ProgressCard } from "./ProgressCard";
import { QuickActions } from "./QuickActions";
import { TeamPromptsCard } from "./TeamPromptsCard";
import { TodayCard } from "./TodayCard";
import { DashboardListCard } from "./DashboardListCard";
import { Button, Field } from "@/components/ui";
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

type PlannerRangeKey = PlannerOverviewProps["range"];
type PlannerRangeOption = PlannerOverviewProps["ranges"][number];

interface PlannerRangeTabsProps {
  activeRange: PlannerRangeKey;
  options: readonly PlannerRangeOption[];
  onSelectRange: PlannerOverviewProps["onSelectRange"];
}

const cardActionsBaseClass =
  "flex flex-wrap items-center gap-[var(--space-2)]";

type HeroCardHeaderProps = Omit<
  React.ComponentProps<typeof CardHeader>,
  "title"
> & {
  eyebrow?: React.ReactNode;
  eyebrowClassName?: string;
  title?: React.ReactNode;
  titleClassName?: string;
  actions?: React.ReactNode;
  actionsClassName?: string;
};

function HeroCardHeader({
  eyebrow,
  eyebrowClassName,
  title,
  titleClassName,
  actions,
  actionsClassName,
  className,
  children,
  ...props
}: HeroCardHeaderProps) {
  if (children) {
    return (
      <CardHeader className={className} {...props}>
        {children}
      </CardHeader>
    );
  }

  return (
    <CardHeader
      {...props}
      className={cn("space-y-[var(--space-3)]", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          {eyebrow ? (
            <p
              className={cn(
                "text-label font-medium uppercase tracking-[0.08em] text-muted-foreground",
                eyebrowClassName,
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3
              className={cn(
                "text-title font-semibold text-card-foreground tracking-[-0.01em]",
                titleClassName,
              )}
            >
              {title}
            </h3>
          ) : null}
        </div>
        {actions ? (
          <div
            className={cn(
              cardActionsBaseClass,
              "justify-end text-right",
              actionsClassName,
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </CardHeader>
  );
}

const PlannerRangeTabs = React.memo(function PlannerRangeTabs({
  activeRange,
  options,
  onSelectRange,
}: PlannerRangeTabsProps) {
  return (
    <div role="group" aria-label="Planner range" className={styles.rangeTabs}>
      {options.map((option) => {
        const isActive = option.key === activeRange;
        return (
          <button
            key={option.key}
            type="button"
            className={styles.rangeTab}
            data-active={isActive ? "true" : undefined}
            aria-pressed={isActive}
            onClick={() => {
              if (isActive) return;
              onSelectRange(option.key);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
});
PlannerRangeTabs.displayName = "PlannerRangeTabs";

const HeroPlannerCards = React.memo(function HeroPlannerCards({
  variant,
  plannerOverviewProps,
  highlights,
  className,
}: HeroPlannerCardsProps) {
  const { summary, goals, calendar, activity, range, ranges, onSelectRange } =
    plannerOverviewProps;
  const { days, onSelectDay } = calendar;
  type InsightTabKey = "activity" | "prompts" | "calendar";

  const [activeTab, setActiveTab] = React.useState<InsightTabKey>("activity");
  const tabBaseId = React.useId();
  const aiDraftHelperId = React.useId();

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

  const calendarRangeControls = React.useMemo(() => {
    if (ranges.length <= 1) {
      return null;
    }
    return (
      <PlannerRangeTabs
        activeRange={range}
        options={ranges}
        onSelectRange={onSelectRange}
      />
    );
  }, [onSelectRange, range, ranges]);

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
          headerActions: calendarRangeControls,
        },
      ] satisfies readonly {
        key: InsightTabKey;
        label: string;
        render: () => React.ReactNode;
        headerActions?: React.ReactNode;
      }[],
    [
      activity,
      calendar.label,
      calendarRangeControls,
      calendarSummary,
      days,
      handleSelectDay,
    ],
  );

  React.useEffect(() => {
    if (insightTabs.some((tab) => tab.key === activeTab)) {
      return;
    }

    const fallbackTab = insightTabs[0];
    if (!fallbackTab) {
      return;
    }

    setActiveTab(fallbackTab.key);
  }, [activeTab, insightTabs]);

  const activeTabDefinition = React.useMemo(
    () => insightTabs.find((tab) => tab.key === activeTab),
    [activeTab, insightTabs],
  );

  const trimmedActiveGoals = React.useMemo(
    () => goals.active.slice(0, 3),
    [goals.active],
  );
  const hasGoals = goals.total > 0;
  const hasActiveGoals = trimmedActiveGoals.length > 0;
  const momentumRingLabel = hasGoals ? `${goals.percentage}%` : "0%";

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
            <Card className={styles.widgetCard}>
              <HeroCardHeader
                title="Quick calibrations"
                titleClassName="text-ui font-semibold text-card-foreground tracking-[-0.01em]"
              />
              <CardBody className="text-card-foreground">
                <QuickActions />
              </CardBody>
            </Card>
          </div>
          <div className={cn("md:col-span-6", styles.splitHalf)}>
            <Card className={cn(styles.widgetCard, styles.roomCard)}>
              <HeroCardHeader
                title="Ambient room"
                titleClassName="text-ui font-semibold text-card-foreground tracking-[-0.01em]"
              />
              <CardBody className={cn("flex justify-center", styles.roomBody)}>
                <IsometricRoom variant={variant} />
              </CardBody>
            </Card>
          </div>
        </div>
        <div className={cn("col-span-full", styles.overviewRow)}>
          <Card>
            <HeroCardHeader
              eyebrow={summary.label}
              eyebrowClassName="text-label font-medium uppercase tracking-[0.08em] text-muted-foreground"
              title={summary.title}
              titleClassName="text-title font-semibold text-card-foreground tracking-[-0.01em]"
            />
            <CardBody className="text-card-foreground">
              <ul className="grid gap-[var(--space-2)]" role="list">
                {upcomingItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={withBasePath(item.href, { skipForNextLink: true })}
                      className={cn(
                        "group flex items-center justify-between gap-[var(--space-3)] rounded-[var(--control-radius)] border border-card-hairline/60 bg-card/70 px-[var(--space-3)] py-[var(--space-2)] transition",
                        "hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                        "active:border-primary/60 active:bg-card/80",
                      )}
                    >
                      <div className="flex min-w-0 flex-col gap-[var(--space-1)]">
                        <span className="text-label text-muted-foreground">{item.label}</span>
                        <span className="text-ui font-semibold text-card-foreground text-balance">
                          {item.value}
                        </span>
                      </div>
                      <span className="shrink-0 text-label font-medium text-primary transition-colors group-hover:text-primary-foreground group-active:text-primary-foreground">
                        {item.cta}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
            <div className={cn(cardActionsBaseClass, "justify-end")}> 
              <Button
                asChild
                size="sm"
                variant="default"
                className={styles.primaryButton}
              >
                <Link href={withBasePath("/planner", { skipForNextLink: true })}>Open planner</Link>
              </Button>
            </div>
          </Card>
          <Card>
            <HeroCardHeader
              eyebrow={goals.label}
              eyebrowClassName="text-label font-medium uppercase tracking-[0.08em] text-muted-foreground"
              title={goals.title}
              titleClassName="text-title font-semibold text-card-foreground tracking-[-0.01em]"
              actions={
                <div className="text-right">
                  <p className="text-label text-muted-foreground">Completed</p>
                  <p className="text-ui font-medium tabular-nums text-card-foreground">
                    {goals.completed}/{goals.total}
                  </p>
                </div>
              }
            />
            <CardBody className="space-y-[var(--space-5)] text-card-foreground">
              <ProgressCard
                label="Goals completion"
                metric={
                  hasGoals ? (
                    <span className="tabular-nums">
                      {goals.completed}/{goals.total} complete
                    </span>
                  ) : undefined
                }
                percentage={hasGoals ? goals.percentage : 0}
                ringLabel={momentumRingLabel}
              >
                {!hasGoals ? (
                  <p className="text-label text-muted-foreground">{goals.emptyMessage}</p>
                ) : hasActiveGoals ? (
                  trimmedActiveGoals.map((goal) => (
                    <div key={goal.id} className="space-y-[var(--space-1)]">
                      <p className="text-ui font-medium text-card-foreground">{goal.title}</p>
                      {goal.detail ? (
                        <p className="text-label text-muted-foreground">{goal.detail}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-label text-muted-foreground">{goals.allCompleteMessage}</p>
                )}
              </ProgressCard>
              <div className={styles.calendarStrip}>
                <div className={styles.calendarMeta}>
                  <p className="text-label font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {calendar.label}
                  </p>
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
            </CardBody>
          </Card>
        </div>
        <div className={cn("col-span-full", styles.plannerGrid)}>
          <TodayCard
            title="Today's plan"
            emptyMessage="No tasks scheduled today"
            listCta={{ label: "Add task", href: "/planner?intent=create-task" }}
            headerAction={{
              label: "Add task",
              href: "/planner?intent=create-task",
              variant: "default",
              tone: "primary",
            }}
            footerAction={{
              label: "Open planner",
              href: "/planner",
              variant: "default",
              tone: "primary",
            }}
            cardClassName={styles.plannerGridCard}
          />
          <GoalsCard
            title="Active goals"
            emptyMessage="No active goals yet"
            listCta={{ label: "Add goal", href: "/goals?intent=create-goal" }}
            headerAction={{
              label: "Add goal",
              href: "/goals?intent=create-goal",
              variant: "default",
            }}
            footerAction={{ label: "Manage goals", href: "/goals", variant: "quiet" }}
            cardClassName={styles.plannerGridCard}
          />
          <DashboardListCard
            title="Upcoming & highlights"
            items={highlights}
            emptyMessage="No highlights yet"
            listCta={{ label: "Add highlight", href: "/planner" }}
            headerAction={{ label: "See calendar", href: "/planner", variant: "quiet" }}
            footerAction={{
              label: "Open planner",
              href: "/planner",
              variant: "default",
              tone: "primary",
            }}
            cardProps={{ className: styles.plannerGridCardWide }}
            getKey={(highlight) => highlight.id}
            renderItem={(highlight) => (
              <article className="space-y-[var(--space-2)]">
                <header className="flex flex-wrap items-baseline justify-between gap-[var(--space-2)]">
                  <p className="text-ui font-semibold text-card-foreground">{highlight.title}</p>
                  <p className="text-label text-muted-foreground">{highlight.schedule}</p>
                </header>
                <p className="text-label text-muted-foreground">{highlight.summary}</p>
              </article>
            )}
          />
        </div>
        <Card className="col-span-full">
          <HeroCardHeader className={styles.tabHeader}>
            <div className={styles.tabList} role="tablist" aria-label="Planner insights">
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
            {activeTabDefinition?.headerActions ? (
              <div className={styles.tabActions}>{activeTabDefinition.headerActions}</div>
            ) : null}
          </HeroCardHeader>
          <CardBody className={cn(styles.tabPanels, "text-card-foreground")}>
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
          </CardBody>
        </Card>
        <Card className="col-span-full">
          <HeroCardHeader title="AI Draft" />
          <CardBody className="space-y-[var(--space-4)] text-card-foreground">
            <p className="text-label text-muted-foreground">
              Agnes and Noxi surfaced three momentum bets. Everything stays editable, retryable, and dismissible.
            </p>
            <Field.Root
              variant="sunken"
              helper="Confidence: medium. Suggestions will adapt once you complete today’s plan or dismiss items manually."
              helperId={aiDraftHelperId}
            >
              <Field.Textarea
                aria-describedby={aiDraftHelperId}
                placeholder="Review and refine the draft before sharing with your team…"
                rows={4}
              />
            </Field.Root>
          </CardBody>
          <div className={cn(cardActionsBaseClass, "justify-end")}> 
            <Button size="sm" variant="quiet" className={styles.secondaryButton}>
              Retry suggestions
            </Button>
            <Button size="sm" variant="default" className={styles.primaryButton}>
              Edit draft
            </Button>
            <Button size="sm" variant="quiet" className={styles.secondaryButton}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
});

HeroPlannerCards.displayName = "HeroPlannerCards";
export { HeroPlannerCards };
