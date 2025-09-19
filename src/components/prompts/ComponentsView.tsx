"use client";

import * as React from "react";
import Fuse from "fuse.js";
import { Card, CardContent, Skeleton, Snackbar } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import { SPEC_DATA, type Section, type Spec } from "./constants";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type ComponentsViewProps = {
  query: string;
  section: Section;
  onCurrentCodeChange?: (code: string | null) => void;
  onFilteredCountChange?: (count: number) => void;
};

type SpecCardProps = Spec & {
  disabled?: boolean;
  onCodeVisibilityChange?: (
    specId: string,
    code: string | null,
    visible: boolean,
  ) => void;
};

function SpecCard({
  id,
  name,
  description,
  element,
  props,
  code,
  disabled,
  onCodeVisibilityChange,
}: SpecCardProps) {
  const [showCode, setShowCode] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const codeId = React.useMemo(() => `${id}-source`, [id]);
  const headingId = React.useId();
  const descriptionId = React.useMemo(
    () => (description ? `${id}-description` : undefined),
    [description, id],
  );
  const reduceMotion = usePrefersReducedMotion();
  const cardTokens = React.useMemo(
    () =>
      ({
        "--spec-card-raise": reduceMotion ? "0px" : "var(--spacing-0-25)",
        "--spec-card-press": reduceMotion ? "0px" : "var(--spacing-0-25)",
      }) as React.CSSProperties,
    [reduceMotion],
  );
  const isDisabled = Boolean(disabled);

  const handleToggleCode = React.useCallback(() => {
    if (!code || isDisabled) {
      return;
    }

    setShowCode((prev) => {
      const next = !prev;
      onCodeVisibilityChange?.(id, code, next);
      return next;
    });
  }, [code, id, isDisabled, onCodeVisibilityChange]);

  const handlePointerDown = React.useCallback(() => {
    if (isDisabled) return;
    setIsPressed(true);
  }, [isDisabled]);

  const handlePointerReset = React.useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (isDisabled) return;

      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        if (event.key !== "Enter") {
          event.preventDefault();
        }
        setIsPressed(true);
      }
    },
    [isDisabled],
  );

  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (isDisabled) return;

      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        setIsPressed(false);
      }
    },
    [isDisabled],
  );

  const cardClassName = cn(
    "group/spec-card relative isolate flex flex-col gap-[var(--space-4)] overflow-hidden",
    "rounded-[var(--radius-card)] border border-[hsl(var(--card-hairline)/0.75)]",
    "bg-[linear-gradient(140deg,hsl(var(--card)/0.95),hsl(var(--surface-2)/0.78))]",
    "px-[var(--space-6)] py-[var(--space-5)]",
    "shadow-neo",
    "hover:shadow-neo-soft focus-visible:shadow-neo-soft",
    "transition-[transform,box-shadow,filter] duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    "hover:-translate-y-[var(--spec-card-raise)] focus-visible:-translate-y-[var(--spec-card-raise)] data-[active=true]:translate-y-[var(--spec-card-press)]",
    "motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0 motion-reduce:data-[active=true]:translate-y-0",
    "active:shadow-neo-inset data-[active=true]:shadow-neo-inset",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60 data-[disabled=true]:shadow-neo-inset",
    "before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit]",
    "before:bg-[radial-gradient(125%_85%_at_18%_-25%,hsl(var(--accent)/0.3),transparent_65%),radial-gradient(125%_85%_at_82%_-20%,hsl(var(--ring)/0.28),transparent_60%)]",
    "before:opacity-75 before:mix-blend-screen motion-reduce:before:opacity-55",
    "after:pointer-events-none after:absolute after:-inset-px after:-z-10 after:rounded-[inherit]",
    "after:bg-[linear-gradient(120deg,hsl(var(--accent)/0.12)_0%,transparent_58%,hsl(var(--ring)/0.16)_100%),repeating-linear-gradient(0deg,hsl(var(--ring)/0.12)_0,hsl(var(--ring)/0.12)_1px,transparent_1px,transparent_calc(var(--space-3)))]",
    "after:opacity-65 after:mix-blend-soft-light motion-reduce:after:opacity-45",
  );

  const frameClassName = cn(
    "relative rounded-card r-card-md bg-[hsl(var(--background)/0.94)] p-[var(--space-4)]",
    "shadow-[var(--shadow-inset)]",
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:p-[var(--spacing-0-25)] before:bg-[var(--edge-iris)] before:opacity-35 before:[mask:linear-gradient(hsl(var(--foreground))_0_0)_content-box,linear-gradient(hsl(var(--foreground))_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]",
    "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-[var(--spacing-0-5)] after:rounded-[inherit] after:bg-[linear-gradient(90deg,hsl(var(--accent)/0.28),transparent_55%,hsl(var(--accent-2)/0.32))] after:opacity-70 after:mix-blend-screen",
    "group-data-[active=true]/spec-card:before:opacity-55",
  );

  return (
    <article
      data-active={isPressed ? "true" : undefined}
      data-disabled={isDisabled ? "true" : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerReset}
      onPointerLeave={handlePointerReset}
      onPointerCancel={handlePointerReset}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handlePointerReset}
      style={cardTokens}
      className={cardClassName}
      tabIndex={isDisabled ? -1 : 0}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <header className="flex items-center justify-between">
        <h3
          id={headingId}
          className="text-title leading-[1.3] font-semibold tracking-[-0.01em]"
        >
          {name}
        </h3>
        {code ? (
          <button
            type="button"
            onClick={handleToggleCode}
            aria-expanded={showCode}
            aria-controls={codeId}
            disabled={isDisabled}
            data-pressed={showCode ? "true" : undefined}
            className={cn(
              "group/button relative inline-flex h-[var(--control-h-md)] items-center justify-center gap-[var(--space-1)]",
              "rounded-[var(--radius-full)] px-[var(--space-5)] text-ui font-medium tracking-[-0.01em]",
              "bg-[linear-gradient(140deg,hsl(var(--card)/0.98),hsl(var(--surface-2)/0.82))] text-foreground",
              "border border-[hsl(var(--ring)/0.45)]",
              "shadow-neo hover:shadow-neo-soft focus-visible:shadow-neo-soft",
              "transition-[transform,box-shadow,background,filter] duration-[var(--dur-quick)] ease-out motion-reduce:transition-none",
              "hover:-translate-y-[var(--spacing-0-25)] focus-visible:-translate-y-[var(--spacing-0-25)]",
              "active:translate-y-[var(--spacing-0-25)] active:shadow-neo-inset",
              "data-[pressed=true]:translate-y-[var(--spacing-0-25)] data-[pressed=true]:shadow-neo-inset",
              "motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0 motion-reduce:active:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              "before:pointer-events-none before:absolute before:-inset-[var(--hairline-w)] before:rounded-[var(--radius-full)] before:border before:border-[hsl(var(--ring)/0.35)] before:opacity-0 before:transition-opacity before:duration-[var(--dur-quick)] before:ease-out",
              "focus-visible:before:opacity-100",
              "after:pointer-events-none after:absolute after:inset-0 after:rounded-[var(--radius-full)] after:bg-[radial-gradient(120%_95%_at_50%_0%,hsl(var(--accent)/0.24),transparent_65%)] after:opacity-0 after:transition-opacity after:duration-[var(--dur-quick)] after:ease-out",
              "hover:after:opacity-100 focus-visible:after:opacity-100",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-neo-inset disabled:translate-y-0",
            )}
          >
            {showCode ? "Hide code" : "Show code"}
          </button>
        ) : null}
      </header>
      {description ? (
        <p
          id={descriptionId}
          className="text-ui text-muted-foreground line-clamp-2"
        >
          {description}
        </p>
      ) : null}
      <div className={frameClassName}>{element}</div>
      {code ? (
        <pre
          id={codeId}
          hidden={!showCode}
          aria-hidden={showCode ? undefined : true}
          className="rounded-card r-card-md bg-muted/80 p-[var(--space-4)] text-label overflow-x-auto shadow-[var(--shadow-inset)]"
        >
          <code>{code}</code>
        </pre>
      ) : null}
      {props ? (
        <footer className="mt-auto">
          <ul className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] text-label text-muted-foreground">
            {props.map((p) => (
              <li key={p.label} className="flex items-center gap-[var(--space-1)]">
                <span className="font-medium text-foreground">{p.label}</span>
                <span>{p.value}</span>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </article>
  );
}

export default function ComponentsView({
  query,
  section,
  onCurrentCodeChange,
  onFilteredCountChange,
}: ComponentsViewProps) {
  const countDescriptionId = React.useId();
  const [, setActiveSpecId] = React.useState<string | null>(null);
  const handleCodeVisibilityChange = React.useCallback(
    (specId: string, nextCode: string | null, visible: boolean) => {
      if (!onCurrentCodeChange) return;
      if (visible && nextCode) {
        setActiveSpecId(specId);
        onCurrentCodeChange(nextCode);
        return;
      }

      if (!visible) {
        setActiveSpecId((current) => {
          if (current === specId) {
            onCurrentCodeChange(null);
            return null;
          }
          return current;
        });
      }
    },
    [onCurrentCodeChange],
  );

  React.useEffect(() => {
    if (!onCurrentCodeChange) return;
    onCurrentCodeChange(null);
    setActiveSpecId(null);
  }, [query, section, onCurrentCodeChange]);

  const sectionSpecs = React.useMemo<Spec[]>(() => {
    const baseSpecs = SPEC_DATA[section];
    if (section !== "cards") {
      return baseSpecs;
    }

    const loadingCard: Spec = {
      id: "card-loading-state",
      name: "Card Loading State",
      description: "Skeleton placeholders communicate asynchronous loading.",
      element: (
        <Card>
          <CardContent className="space-y-[var(--space-4)]">
            <div className="space-y-[var(--space-2)]">
              <Skeleton
                ariaHidden={false}
                role="status"
                aria-label="Loading summary"
                className="h-[var(--space-6)] w-3/4"
                radius="sm"
              />
              <Skeleton className="w-full" />
              <Skeleton className="w-4/5" />
            </div>
            <div className="flex items-center gap-[var(--space-3)]">
              <Skeleton
                className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
                radius="full"
              />
              <div className="flex-1 space-y-[var(--space-2)]">
                <Skeleton className="w-3/4" />
                <Skeleton className="w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      tags: ["card", "state", "loading"],
      code: `<Card>
  <CardContent className="space-y-[var(--space-4)]">
    <div className="space-y-[var(--space-2)]">
      <Skeleton
        ariaHidden={false}
        role="status"
        aria-label="Loading summary"
        className="h-[var(--space-6)] w-3/4"
        radius="sm"
      />
      <Skeleton className="w-full" />
      <Skeleton className="w-4/5" />
    </div>
    <div className="flex items-center gap-[var(--space-3)]">
      <Skeleton
        className="h-[var(--space-7)] w-[var(--space-7)] flex-none"
        radius="full"
      />
      <div className="flex-1 space-y-[var(--space-2)]">
        <Skeleton className="w-3/4" />
        <Skeleton className="w-2/3" />
      </div>
    </div>
  </CardContent>
</Card>`,
    };

    const errorCard: Spec = {
      id: "card-error-state",
      name: "Card Error State",
      description: "Snackbar feedback surfaces failure messaging and retry.",
      element: (
        <Card>
          <CardContent className="space-y-[var(--space-3)]">
            <div className="space-y-[var(--space-1)]">
              <h4 className="text-ui font-semibold tracking-[-0.01em]">
                Data unavailable
              </h4>
              <p className="text-label text-muted-foreground">
                Refresh to request the latest match insights.
              </p>
            </div>
            <Snackbar
              message="Sync failed"
              actionLabel="Retry"
              onAction={() => {}}
              className="mx-0 w-full justify-between border-danger/40 bg-danger/15 text-danger-foreground"
            />
          </CardContent>
        </Card>
      ),
      tags: ["card", "state", "error"],
      code: `<Card>
  <CardContent className="space-y-[var(--space-3)]">
    <div className="space-y-[var(--space-1)]">
      <h4 className="text-ui font-semibold tracking-[-0.01em]">
        Data unavailable
      </h4>
      <p className="text-label text-muted-foreground">
        Refresh to request the latest match insights.
      </p>
    </div>
    <Snackbar
      message="Sync failed"
      actionLabel="Retry"
      onAction={() => {}}
      className="mx-0 w-full justify-between border-danger/40 bg-danger/15 text-danger-foreground"
    />
  </CardContent>
</Card>`,
    };

    return [...baseSpecs, loadingCard, errorCard];
  }, [section]);

  const fuse = React.useMemo(
    () =>
      new Fuse(sectionSpecs, {
        keys: ["name", "tags", "props.value"],
        threshold: 0.3,
      }),
    [sectionSpecs],
  );

  const specs = React.useMemo(() => {
    if (!query) return sectionSpecs;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, sectionSpecs]);

  const sectionLabel = React.useMemo(
    () => section.charAt(0).toUpperCase() + section.slice(1),
    [section],
  );

  const filteredCount = specs.length;

  const countLabel = React.useMemo(() => {
    const suffix = filteredCount === 1 ? "spec" : "specs";
    return `${filteredCount} ${sectionLabel.toLowerCase()} ${suffix}`;
  }, [filteredCount, sectionLabel]);

  React.useEffect(() => {
    if (!onFilteredCountChange) return;
    onFilteredCountChange(filteredCount);
  }, [filteredCount, onFilteredCountChange]);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <h2 className="text-ui font-semibold tracking-[-0.01em] text-muted-foreground">
          {sectionLabel} specs
        </h2>
        <Badge
          id={countDescriptionId}
          tone="support"
          size="sm"
          className="text-muted-foreground"
        >
          {countLabel}
        </Badge>
      </header>
      <ul
        className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-12 md:gap-[var(--space-5)] xl:gap-[var(--space-6)]"
        aria-describedby={countDescriptionId}
      >
        {specs.length === 0 ? (
          <li className="col-span-full">
            <Card>
              <CardContent>No results found</CardContent>
            </Card>
          </li>
        ) : (
          specs.map((spec) => (
            <li
              key={spec.id}
              className="col-span-full md:col-span-6 lg:col-span-4 xl:col-span-3"
            >
              <SpecCard
                {...spec}
                onCodeVisibilityChange={handleCodeVisibilityChange}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
