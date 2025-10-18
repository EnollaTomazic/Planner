"use client";

import * as React from "react";
import { Database } from "lucide-react";

import {
  Badge,
  Progress,
  VirtualizedList,
} from "@/components/ui";
import type { MetricsPayload } from "@/metrics";
import { createMockMetricsFeed } from "@/metrics/fixtures";
import { spacingTokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = spacingTokens[6] ?? 48;
const STATIC_RENDER_THRESHOLD = 32;
const MAX_CHART_POINTS = 120;
const WINDOW_POINTS = 240;
const METRICS_FEED = createMockMetricsFeed(5);

type BacklogItem = {
  readonly id: number;
  readonly title: string;
  readonly priority: "Critical" | "High" | "Medium" | "Low";
  readonly owner: string;
  readonly estimate: number;
  readonly completed: boolean;
};

type LoadPoint = {
  readonly iso: string;
  readonly label: string;
  readonly value: number;
};

const PRIORITIES: BacklogItem["priority"][] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const OWNERS = [
  "Research",
  "Onboarding",
  "Growth",
  "Integrations",
  "Billing",
  "Insights",
];

type BadgeTone = NonNullable<React.ComponentProps<typeof Badge>["tone"]>;

const OWNER_BADGES: Record<string, BadgeTone> = {
  Research: "neutral",
  Onboarding: "accent",
  Growth: "top",
  Integrations: "support",
  Billing: "primary",
  Insights: "bot",
};

const ownerTone = (owner: string): BadgeTone => {
  if (OWNER_BADGES[owner]) {
    return OWNER_BADGES[owner]!;
  }
  return "neutral";
};

const estimateLabel = (estimate: number) => `${estimate.toFixed(1)}h`;

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const createBacklog = (): BacklogItem[] => {
  return Array.from({ length: 420 }, (_, index) => {
    const priority = PRIORITIES[index % PRIORITIES.length]!;
    const owner = OWNERS[index % OWNERS.length] ?? OWNERS[0]!;
    const estimate = 1.5 + ((index * 1.3) % 6);
    return {
      id: index + 1,
      title: `Scenario audit ${String(index + 1).padStart(3, "0")}`,
      priority,
      owner,
      estimate,
      completed: index % 11 === 0,
    } satisfies BacklogItem;
  });
};

const createLoadSeries = (): LoadPoint[] => {
  const now = new Date();
  const samples = 24 * 30;
  return Array.from({ length: samples }, (_, index) => {
    const date = new Date(now.getTime() - index * 60 * 60 * 1000);
    const value = 0.4 + Math.sin(index / 9) * 0.25 + Math.random() * 0.2;
    const clamped = clamp(value, 0.1, 1);
    return {
      iso: date.toISOString(),
      label: date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
      }),
      value: clamped,
    } satisfies LoadPoint;
  }).reverse();
};

const BACKLOG_ITEMS = createBacklog();
const LOAD_SERIES = createLoadSeries();

export default function PerfPreviewClient() {
  return (
    <div className="space-y-[var(--space-6)]">
      <MetricsFeedPanel payloads={METRICS_FEED} />
      <VirtualizedBacklogPanel items={BACKLOG_ITEMS} />
      <LoadWindowPanel points={LOAD_SERIES} />
    </div>
  );
}

const RATING_TONE: Record<
  NonNullable<MetricsPayload["metric"]["rating"]>,
  BadgeTone
> = {
  good: "primary",
  "needs-improvement": "accent",
  poor: "bot",
};

function MetricsFeedPanel({ payloads }: { readonly payloads: readonly MetricsPayload[] }) {
  return (
    <section aria-labelledby="perf-metrics-heading" className="space-y-[var(--space-4)]" data-perf-panel="metrics-feed">
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          <h2 id="perf-metrics-heading" className="text-heading-sm font-semibold tracking-[-0.01em]">
            Web vitals dispatch
          </h2>
          <p className="max-w-3xl text-label text-muted-foreground">
            Metrics helpers normalize entries for previews, tests, and production reporting so tone swatches stay aligned
            across themes.
          </p>
        </div>
        <Badge tone="support" className="uppercase tracking-[0.12em]">
          {payloads.length} captured
        </Badge>
      </header>
      <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
        {payloads.map((payload) => {
          const rating = payload.metric.rating ?? "good";
          return (
            <article
              key={`${payload.metric.id}-${payload.timestamp}`}
              className="space-y-[var(--space-3)] rounded-[var(--radius-lg)] border border-border/40 bg-surface/60 p-[var(--space-4)]"
            >
              <header className="flex items-center justify-between gap-[var(--space-3)]">
                <div className="space-y-[var(--space-1)]">
                  <p className="text-caption uppercase tracking-[0.12em] text-muted-foreground">{payload.page}</p>
                  <h3 className="text-body font-semibold text-foreground">{payload.metric.name}</h3>
                </div>
                <Badge tone={RATING_TONE[rating]}>{formatRatingLabel(rating)}</Badge>
              </header>
              <dl className="grid gap-[var(--space-2)] text-label text-muted-foreground">
                <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                  <dt className="uppercase tracking-[0.12em]">Value</dt>
                  <dd className="text-body font-medium text-foreground">{formatMetricValue(payload.metric)}</dd>
                </div>
                {payload.metric.delta !== undefined ? (
                  <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                    <dt className="uppercase tracking-[0.12em]">Delta</dt>
                    <dd className="text-body font-medium text-foreground">{formatDelta(payload.metric.delta)}</dd>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                  <dt className="uppercase tracking-[0.12em]">Recorded</dt>
                  <dd className="font-medium text-foreground">{new Date(payload.timestamp).toLocaleTimeString()}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatRatingLabel(rating: NonNullable<MetricsPayload["metric"]["rating"]>): string {
  return rating
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatMetricValue(metric: MetricsPayload["metric"]): string {
  switch (metric.name) {
    case "CLS":
      return metric.value.toFixed(2);
    case "FID":
    case "TTFB":
      return `${Math.round(metric.value)}ms`;
    case "LCP":
      return `${(metric.value / 1000).toFixed(2)}s`;
    default:
      return `${metric.value}`;
  }
}

function formatDelta(delta: number): string {
  if (Number.isNaN(delta)) {
    return "0";
  }

  if (delta >= 1000) {
    return `${(delta / 1000).toFixed(2)}s`;
  }

  if (delta >= 1) {
    return `${Math.round(delta)}ms`;
  }

  return delta.toFixed(2);
}

function VirtualizedBacklogPanel({ items }: { readonly items: readonly BacklogItem[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const shouldVirtualize = items.length > STATIC_RENDER_THRESHOLD;
  const statusLabel = shouldVirtualize
    ? "Virtualized rendering active"
    : "Static rendering";
  const liveMessage = shouldVirtualize
    ? `Virtualized list enabled for ${items.length} items.`
    : `Rendering ${items.length} items without virtualization.`;

  return (
    <section
      aria-labelledby="perf-backlog-heading"
      className="space-y-[var(--space-4)]"
      data-perf-panel="backlog"
    >
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          <h2 id="perf-backlog-heading" className="text-heading-sm font-semibold tracking-[-0.01em]">
            Backlog virtualization guard
          </h2>
          <p className="max-w-3xl text-label text-muted-foreground">
            Lists switch to windowed rendering once rows exceed {STATIC_RENDER_THRESHOLD} entries.
            Spacer elements hold layout so theme shadows stay stable for screenshot audits.
          </p>
        </div>
        <Badge tone={shouldVirtualize ? "accent" : "neutral"} className="uppercase tracking-[0.12em]">
          {statusLabel}
        </Badge>
      </header>
      <div
        aria-live="polite"
        className="sr-only"
        data-perf-virtualized-announcement=""
      >
        {liveMessage}
      </div>
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border/40">
        <div className="flex items-center justify-between gap-[var(--space-3)] border-b border-border/40 bg-surface/60 px-[var(--space-3)] py-[var(--space-2)] text-caption uppercase tracking-[0.12em] text-muted-foreground">
          <span>Scenario</span>
          <span className="flex items-center gap-[var(--space-2)] text-right">
            Virtual scroll budget
            <Database aria-hidden="true" className="h-[var(--space-4)] w-[var(--space-4)] opacity-60" />
          </span>
        </div>
        <div
          ref={scrollRef}
          className={cn(
            "max-h-[calc(var(--space-8)*6)] overflow-y-auto", 
            "bg-card text-ui",
          )}
        >
          <table className="w-full border-separate border-spacing-0" role="grid">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              <tr className="text-left text-caption uppercase tracking-[0.12em] text-muted-foreground">
                <th scope="col" className="px-[var(--space-3)] py-[var(--space-2)]">ID</th>
                <th scope="col" className="px-[var(--space-3)] py-[var(--space-2)]">Scenario</th>
                <th scope="col" className="px-[var(--space-3)] py-[var(--space-2)]">Owner</th>
                <th scope="col" className="px-[var(--space-3)] py-[var(--space-2)] text-right">Estimate</th>
              </tr>
            </thead>
            <tbody>
              {shouldVirtualize ? (
                <VirtualizedList
                  items={items}
                  rowHeight={ROW_HEIGHT}
                  overscan={6}
                  scrollParentRef={scrollRef}
                  renderSpacer={(height, position) => (
                    <tr aria-hidden className="h-0" data-virtualized-spacer={position}>
                      <td colSpan={4}>
                        <div style={{ blockSize: `${Math.max(0, height)}px` }} />
                      </td>
                    </tr>
                  )}
                  renderItem={(item) => (
                    <BacklogRow key={item.id} item={item} />
                  )}
                />
              ) : (
                items.map((item) => <BacklogRow key={item.id} item={item} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function BacklogRow({ item }: { readonly item: BacklogItem }) {
  return (
    <tr
      className="border-b border-border/30 last:border-b-0"
      data-virtualized-row={item.id}
      style={{ blockSize: "var(--space-6)" }}
    >
      <th
        scope="row"
        className="w-[var(--space-12)] px-[var(--space-3)] text-caption uppercase tracking-[0.12em] text-muted-foreground"
      >
        #{item.id.toString().padStart(3, "0")}
      </th>
      <td className="px-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="text-body font-medium text-foreground">{item.title}</span>
          <span className="text-label text-muted-foreground">Priority · {item.priority}</span>
        </div>
      </td>
      <td className="px-[var(--space-3)]">
        <Badge tone={ownerTone(item.owner)}>{item.owner}</Badge>
      </td>
      <td className="px-[var(--space-3)] text-right">
        <div className="inline-flex items-center gap-[var(--space-2)]">
          <div className="w-[calc(var(--space-8)*2)]">
            <Progress
              value={item.completed ? 100 : Math.min(75, item.estimate * 16)}
              label={`Completion estimate for ${item.title}`}
            />
          </div>
          <span className="text-label text-muted-foreground">{estimateLabel(item.estimate)}</span>
        </div>
      </td>
    </tr>
  );
}

function LoadWindowPanel({ points }: { readonly points: readonly LoadPoint[] }) {
  const [windowStart, setWindowStart] = React.useState(() => Math.max(0, points.length - WINDOW_POINTS));
  const aggregated = React.useMemo(() => aggregateSeries(points, windowStart, WINDOW_POINTS, MAX_CHART_POINTS), [
    points,
    windowStart,
  ]);

  const coverage = aggregated.coverage;
  const liveMessage = `Showing ${coverage.visible} of ${coverage.total} intervals (${coverage.window} in focus).`;

  return (
    <section aria-labelledby="perf-load-heading" className="space-y-[var(--space-4)]" data-perf-panel="load-window">
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          <h2 id="perf-load-heading" className="text-heading-sm font-semibold tracking-[-0.01em]">
            Chart windowing guard
          </h2>
          <p className="max-w-3xl text-label text-muted-foreground">
            Load trends stream 30 days of hourly samples but only render {MAX_CHART_POINTS} points per window.
            The scrub control advances a two-day window without introducing layout shift.
          </p>
        </div>
        <Badge tone="accent" className="uppercase tracking-[0.12em]">
          Downsampled {aggregated.series.length}
        </Badge>
      </header>
      <div className="sr-only" aria-live="polite" data-perf-load-announcement="">
        {liveMessage}
      </div>
      <figure className="space-y-[var(--space-4)]">
        <LoadChart series={aggregated.series} />
        <figcaption className="flex flex-col gap-[var(--space-2)] text-label text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <span>{liveMessage}</span>
            <span>
              Window start: <span className="font-medium text-foreground">{aggregated.windowLabel}</span>
            </span>
          </div>
          <label className="flex flex-col gap-[var(--space-2)] text-caption uppercase tracking-[0.12em]">
            Scrub visible window
            <input
              type="range"
              min={0}
              max={Math.max(points.length - WINDOW_POINTS, 0)}
              value={windowStart}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                setWindowStart(Number.isNaN(value) ? 0 : value);
              }}
              className="h-[var(--space-2)] w-full cursor-ew-resize appearance-none rounded-full bg-border accent-[hsl(var(--accent))]"
              aria-valuetext={`Starting ${aggregated.windowLabel}`}
            />
          </label>
        </figcaption>
      </figure>
    </section>
  );
}

interface AggregatedSeries {
  readonly series: readonly LoadPoint[];
  readonly windowLabel: string;
  readonly coverage: {
    readonly total: number;
    readonly window: number;
    readonly visible: number;
  };
}

function aggregateSeries(
  points: readonly LoadPoint[],
  windowStart: number,
  windowSize: number,
  maxPoints: number,
): AggregatedSeries {
  if (points.length === 0) {
    return {
      series: [],
      windowLabel: "No data",
      coverage: { total: 0, window: 0, visible: 0 },
    };
  }

  const start = clamp(windowStart, 0, Math.max(0, points.length - 1));
  const end = clamp(start + windowSize, start + 1, points.length);
  const window = points.slice(start, end);
  const bucketSize = Math.max(1, Math.ceil(window.length / maxPoints));
  const buckets: LoadPoint[] = [];

  for (let index = 0; index < window.length; index += bucketSize) {
    const slice = window.slice(index, index + bucketSize);
    const average =
      slice.reduce((total, point) => total + point.value, 0) / Math.max(slice.length, 1);
    const representative = slice[Math.floor(slice.length / 2)] ?? slice[0]!;
    buckets.push({
      iso: representative.iso,
      label: representative.label,
      value: average,
    });
  }

  return {
    series: buckets,
    windowLabel: window[0]?.label ?? "",
    coverage: {
      total: points.length,
      window: window.length,
      visible: buckets.length,
    },
  };
}

function LoadChart({ series }: { readonly series: readonly LoadPoint[] }) {
  const chartId = React.useId();
  if (series.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border/50 bg-surface/40 p-[var(--space-6)] text-center text-label text-muted-foreground">
        No load data available.
      </div>
    );
  }

  const height = 120;
  const width = series.length - 1 || 1;
  const pathSegments = series
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${index} ${height - point.value * height}`;
    })
    .join(" ");

  return (
    <div className="space-y-[var(--space-3)]">
      <div className="rounded-[var(--radius-lg)] border border-border/40 bg-surface/40 p-[var(--space-3)]">
        <svg
          aria-labelledby={chartId}
          viewBox={`0 0 ${Math.max(width, 1)} ${height}`}
          preserveAspectRatio="none"
          className="h-[calc(var(--space-8)*3)] w-full"
          role="img"
        >
          <title id={chartId}>Virtualized hourly load</title>
          <path d={`${pathSegments}`} fill="none" stroke="hsl(var(--accent))" strokeWidth={1.5} />
          <path
            d={`${pathSegments} L ${Math.max(width, 1)} ${height} L 0 ${height} Z`}
            fill="hsl(var(--accent)/0.16)"
          />
        </svg>
      </div>
      <dl className="grid gap-[var(--space-2)] text-caption text-muted-foreground sm:grid-cols-2">
        <div className="flex flex-col gap-[var(--space-1)]">
          <dt className="uppercase tracking-[0.12em]">Visible points</dt>
          <dd className="text-body text-foreground">{series.length}</dd>
        </div>
        <div className="flex flex-col gap-[var(--space-1)]">
          <dt className="uppercase tracking-[0.12em]">Peak load</dt>
          <dd className="text-body text-foreground">{Math.round(Math.max(...series.map((point) => point.value)) * 100)}%</dd>
        </div>
      </dl>
    </div>
  );
}
