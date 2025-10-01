"use client";

import * as React from "react";

import DashboardCard from "./DashboardCard";
import type {
  PlannerOverviewActivityPoint,
  PlannerOverviewActivityProps,
} from "./home-landing";
import Skeleton from "@/components/ui/feedback/Skeleton";
import { cn } from "@/lib/utils";

interface ActivityCardProps extends PlannerOverviewActivityProps {
  className?: string;
}

const CHART_HEIGHT = 72;
const CHART_WIDTH = 100;

export default function ActivityCard({
  loading,
  hasData,
  totalCompleted,
  totalScheduled,
  points,
  className,
}: ActivityCardProps) {
  if (loading) {
    return (
      <DashboardCard title="Weekly activity" headerLoading>
        <div className={cn("space-y-[var(--space-4)]", className)}>
          <div className="space-y-[var(--space-2)]">
            <Skeleton className="h-[var(--space-4)] w-1/3" ariaHidden={false} />
            <Skeleton className="h-[var(--space-8)] w-1/2" ariaHidden={false} />
            <Skeleton className="h-[var(--space-4)] w-1/3" ariaHidden={false} />
          </div>
          <Skeleton
            className="h-[calc(var(--space-8)*2-var(--space-2))]"
            radius="card"
            ariaHidden={false}
          />
        </div>
      </DashboardCard>
    );
  }

  const completionRate = hasData && totalScheduled > 0
    ? Math.round((totalCompleted / totalScheduled) * 100)
    : 0;

  const completionLabel = hasData
    ? `${totalCompleted}/${totalScheduled} tasks complete`
    : "No scheduled tasks yet";

  return (
    <DashboardCard title="Weekly activity">
      <div
        className={cn(
          "grid gap-[var(--space-4)]",
          hasData ? "grid-rows-[auto_auto]" : "grid-rows-[auto]",
          className,
        )}
      >
        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
            <div>
              <p className="text-label text-muted-foreground uppercase tracking-[0.08em]">
                Completion
              </p>
              <p className="text-title font-semibold tabular-nums">{completionRate}%</p>
            </div>
            <p className="text-label text-muted-foreground tabular-nums">
              {completionLabel}
            </p>
          </div>
          {hasData ? (
            <p className="text-body text-muted-foreground">
              Completion trend for the current planner week.
            </p>
          ) : (
            <EmptyStateMessage />
          )}
        </div>
        {hasData ? <ActivityChart points={points} /> : null}
      </div>
    </DashboardCard>
  );
}

function EmptyStateMessage() {
  return (
    <div className="flex flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-dashed border-card-hairline-60 bg-surface/40 p-[var(--space-4)] text-left">
      <p className="text-ui font-medium text-muted-foreground">
        Activity history will appear once tasks are planned.
      </p>
      <p className="text-label text-muted-foreground">
        Schedule a few tasks this week to capture momentum.
      </p>
    </div>
  );
}

function ActivityChart({
  points,
}: {
  points: readonly PlannerOverviewActivityPoint[];
}) {
  const chartId = React.useId();

  const coordinates = React.useMemo(() => {
    if (points.length === 0) {
      return [] as const;
    }
    if (points.length === 1) {
      const value = getPointValue(points[0]);
      const y = CHART_HEIGHT - value * CHART_HEIGHT;
      return [{ x: CHART_WIDTH / 2, y }] as const;
    }
    return points.map((point, index) => {
      const ratio = points.length > 1 ? index / (points.length - 1) : 0;
      const value = getPointValue(point);
      const x = ratio * CHART_WIDTH;
      const y = CHART_HEIGHT - value * CHART_HEIGHT;
      return { x, y } as const;
    });
  }, [points]);

  if (coordinates.length === 0) {
    return null;
  }

  const first = coordinates[0]!;
  const last = coordinates[coordinates.length - 1]!;
  const areaSegments = coordinates
    .map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const lineSegments = coordinates
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    })
    .join(" ");

  const areaPath = `M ${first.x.toFixed(2)} ${CHART_HEIGHT} ${areaSegments} L ${last.x.toFixed(2)} ${CHART_HEIGHT} Z`;

  return (
    <div className="space-y-[var(--space-3)]">
      <div className="rounded-[var(--radius-lg)] border border-card-hairline-60 bg-surface/60 p-[var(--space-3)]">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className="h-[calc(var(--space-8)*2+var(--space-3))] w-full"
        >
          <path
            d={areaPath}
            fill="hsl(var(--accent) / 0.28)"
          />
          <path
            d={lineSegments}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <dl id={chartId} className="sr-only">
          <dt>Completion by day</dt>
          {points.map((point) => {
            const value = point.total > 0
              ? `${point.completed} of ${point.total}`
              : "No tasks";
            return (
              <dd key={point.iso}>{`${point.label}: ${value}`}</dd>
            );
          })}
        </dl>
      </div>
      <div
        aria-labelledby={chartId}
        className="grid gap-[var(--space-2)] text-caption text-muted-foreground"
        style={{
          gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
        }}
      >
        {points.map((point) => (
          <span key={point.iso} className="text-center uppercase tracking-[0.08em]">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function getPointValue(point: PlannerOverviewActivityPoint) {
  if (point.total <= 0) return 0;
  const ratio = point.completed / point.total;
  return Math.min(Math.max(ratio, 0), 1);
}
