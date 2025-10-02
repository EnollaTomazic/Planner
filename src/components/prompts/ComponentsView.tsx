"use client";

import * as React from "react";

import { IssueBadge } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import type { IssueBadgeSeverity } from "@/components/ui/primitives/IssueBadge";
import {
  type GalleryAxis,
  type GalleryRelatedSurface,
  type GallerySerializableEntry,
  type GallerySerializableStateDefinition,
} from "@/components/gallery";
import { cn } from "@/lib/utils";
import {
  applyTheme,
  VARIANTS,
  defaultTheme,
  type ThemeState,
  type Variant,
} from "@/lib/theme";
import { useOptionalTheme } from "@/lib/theme-context";
import {
  getComponentIssues,
  type ComponentIssue,
  type ComponentIssueSeverity,
  type ComponentIssueStatus,
} from "@/components/gallery-page/component-issues";

import segmentedButtonStyles from "@/components/ui/primitives/SegmentedButton.module.css";

import { getGalleryPreview } from "./constants";

export const PROPS_DISCLOSURE_COLLAPSE_THRESHOLD = 6;

interface ComponentsViewProps {
  entry: GallerySerializableEntry;
  onCurrentCodeChange?: (code: string | null) => void;
}

interface ShowCodeButtonProps {
  controls: string;
  expanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const containerClassName = cn(
  "group/component-view relative isolate flex flex-col gap-[var(--space-6)] overflow-hidden",
  "rounded-card r-card-lg",
  "rounded-[var(--radius-card)] border border-card-hairline-75",
  "bg-panel-tilt-strong",
  "px-[var(--space-6)] py-[var(--space-5)]",
  "shadow-depth-outer",
  "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-[hsl(var(--card))]",
  "before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit]",
  "before:bg-gradient-drip-overlay-compact",
  "before:opacity-75 before:mix-blend-screen motion-reduce:before:opacity-55",
  "after:pointer-events-none after:absolute after:-inset-px after:-z-10 after:rounded-[inherit]",
  "after:bg-glitch-overlay",
  "after:opacity-65 after:mix-blend-soft-light motion-reduce:after:opacity-45",
);

const frameClassName = cn(
  "relative rounded-card r-card-md bg-[hsl(var(--background)/0.94)] p-[var(--space-4)]",
  "shadow-[var(--shadow-inset-hairline)]",
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:p-[var(--spacing-0-25)] before:bg-[var(--edge-iris)] before:opacity-35 before:[mask:linear-gradient(hsl(var(--foreground))_0_0)_content-box,linear-gradient(hsl(var(--foreground))_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]",
  "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-[var(--spacing-0-5)] after:rounded-[inherit] after:bg-hero-topline after:opacity-70 after:mix-blend-screen",
  "group-focus-within/component-view:before:opacity-55",
);

function ThemePreviewSurface({
  variant,
  baseTheme,
  children,
}: {
  variant: Variant;
  baseTheme: ThemeState;
  children: React.ReactNode;
}) {
  const baseThemeRef = React.useRef(baseTheme);

  React.useEffect(() => {
    baseThemeRef.current = baseTheme;
  }, [baseTheme]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const currentBase = baseThemeRef.current;
    if (variant === currentBase.variant) {
      applyTheme(currentBase);
      return;
    }

    applyTheme({ variant, bg: currentBase.bg });
  }, [variant, baseTheme.bg]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    return () => {
      applyTheme(baseThemeRef.current);
    };
  }, []);

  return <div className={frameClassName}>{children}</div>;
}

export function ThemeMatrix({
  entryId,
  previewRenderer,
}: {
  entryId: string;
  previewRenderer: ReturnType<typeof getGalleryPreview>;
}) {
  const themeContext = useOptionalTheme();
  const fallbackTheme = React.useMemo(() => defaultTheme(), []);
  const baseTheme = themeContext?.[0] ?? fallbackTheme;
  const [activeVariant, setActiveVariant] = React.useState<Variant>(
    baseTheme.variant,
  );
  const headingId = React.useId();
  const controlLabelId = React.useId();
  const buttonRefs = React.useRef(new Map<Variant, HTMLButtonElement>());

  const registerButton = React.useCallback(
    (variantId: Variant, node: HTMLButtonElement | null) => {
      const refs = buttonRefs.current;
      if (!node) {
        refs.delete(variantId);
        return;
      }
      refs.set(variantId, node);
    },
    [],
  );

  React.useEffect(() => {
    setActiveVariant(baseTheme.variant);
  }, [baseTheme.variant, entryId]);

  const handleControlKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const key = event.key;
      if (!VARIANTS.length) {
        return;
      }
      if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "ArrowUp" && key !== "ArrowDown") {
        return;
      }
      event.preventDefault();
      const currentIndex = VARIANTS.findIndex(
        ({ id }) => id === activeVariant,
      );
      if (currentIndex === -1) {
        const nextVariant = VARIANTS[0];
        if (nextVariant) {
          setActiveVariant(nextVariant.id);
          buttonRefs.current.get(nextVariant.id)?.focus();
        }
        return;
      }
      const delta = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        (currentIndex + delta + VARIANTS.length) % VARIANTS.length;
      const nextVariant = VARIANTS[nextIndex];
      if (nextVariant) {
        setActiveVariant(nextVariant.id);
        buttonRefs.current.get(nextVariant.id)?.focus();
      }
    },
    [activeVariant],
  );

  const previewNode = React.useMemo(() => {
    if (!previewRenderer) {
      return (
        <div className="text-ui text-muted-foreground">Preview unavailable</div>
      );
    }
    return (
      <React.Suspense fallback={<GalleryPreviewFallback />}>
        {previewRenderer()}
      </React.Suspense>
    );
  }, [previewRenderer]);

  const activeVariantLabel = React.useMemo(() => {
    const match = VARIANTS.find(({ id }) => id === activeVariant);
    return match?.label ?? activeVariant;
  }, [activeVariant]);

  if (VARIANTS.length === 0) {
    return <div className={frameClassName}>{previewNode}</div>;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="space-y-[var(--space-3)]"
    >
      <SectionHeading id={headingId}>Themes</SectionHeading>
      <div className="space-y-[var(--space-2)]">
        <p
          id={controlLabelId}
          className="text-label text-muted-foreground"
        >
          Preview this component across Planner themes.
        </p>
        <div
          role="radiogroup"
          aria-labelledby={controlLabelId}
          className="flex flex-wrap gap-[var(--space-2)]"
          onKeyDown={handleControlKeyDown}
        >
          {VARIANTS.map((variant) => {
            const selected = variant.id === activeVariant;
            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  segmentedButtonStyles.root,
                  "min-h-[var(--control-h-md)] px-[var(--space-4)] py-[var(--space-2)] text-ui",
                  "text-muted-foreground",
                  selected && "is-active text-foreground",
                )}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveVariant(variant.id)}
                data-selected={selected ? "true" : undefined}
                data-depth="raised"
                ref={(node) => registerButton(variant.id, node)}
              >
                {variant.label}
              </button>
            );
          })}
        </div>
      </div>
      <ThemePreviewSurface variant={activeVariant} baseTheme={baseTheme}>
        {previewNode}
      </ThemePreviewSurface>
      <p className="text-caption text-muted-foreground">
        Showing the {" "}
        <span className="font-medium text-foreground">
          {activeVariantLabel}
        </span>{" "}
        theme.
      </p>
    </section>
  );
}

export function ThemeMatrixPreview({
  entryId,
  previewId,
}: {
  entryId: string;
  previewId: string;
}) {
  const previewRenderer = React.useMemo(
    () => getGalleryPreview(previewId),
    [previewId],
  );

  return <ThemeMatrix entryId={entryId} previewRenderer={previewRenderer} />;
}

function GalleryPreviewFallback() {
  return (
    <div
      aria-busy="true"
      className="flex min-h-[var(--space-24)] items-center justify-center text-label text-muted-foreground [--space-24:calc(var(--space-8)*3)]"
    >
      Loading preview…
    </div>
  );
}

function ShowCodeButton({
  controls,
  expanded,
  onToggle,
  disabled,
}: ShowCodeButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      disabled={disabled}
      data-pressed={expanded ? "true" : undefined}
      className={cn(
        "group/button relative inline-flex h-[var(--control-h-md)] items-center justify-center gap-[var(--space-1)]",
        "rounded-full px-[var(--space-5)] text-ui font-medium tracking-[-0.01em]",
        "bg-panel-tilt-bright text-foreground",
        "border border-[hsl(var(--ring)/0.45)]",
        "shadow-depth-outer",
        "hover:shadow-depth-soft focus-visible:shadow-depth-soft",
        "transition-[transform,box-shadow,background,filter] duration-motion-sm ease-out motion-reduce:transition-none",
        "hover:-translate-y-[var(--spacing-0-25)] focus-visible:-translate-y-[var(--spacing-0-25)]",
        "active:translate-y-[var(--spacing-0-25)]",
        "active:shadow-depth-soft",
        "data-[pressed=true]:translate-y-[var(--spacing-0-25)]",
        "data-[pressed=true]:shadow-depth-soft",
        "motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0 motion-reduce:active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]",
        "before:pointer-events-none before:absolute before:-inset-px before:rounded-full before:border before:border-[hsl(var(--ring)/0.35)] before:opacity-0 before:transition-opacity before:duration-motion-sm before:ease-out",
        "focus-visible:before:opacity-100",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-hero-action-halo after:opacity-0 after:transition-opacity after:duration-motion-sm after:ease-out",
        "hover:after:opacity-100 focus-visible:after:opacity-100",
        "disabled:cursor-not-allowed disabled:opacity-disabled disabled:translate-y-0",
        "disabled:shadow-outline-subtle",
      )}
    >
      {expanded ? "Hide code" : "Show code"}
    </button>
  );
}

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="text-ui font-semibold tracking-[-0.01em] text-muted-foreground"
    >
      {children}
    </h3>
  );
}

function PropsTable({
  props,
}: {
  props: NonNullable<GallerySerializableEntry["props"]>;
}) {
  const headingId = React.useId();
  const panelId = React.useId();
  const firstCellRef = React.useRef<HTMLTableCellElement>(null);
  const shouldCollapseByDefault =
    props.length > PROPS_DISCLOSURE_COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = React.useState(!shouldCollapseByDefault);
  const previousExpanded = React.useRef(expanded);

  React.useEffect(() => {
    if (expanded && !previousExpanded.current) {
      firstCellRef.current?.focus();
    }
    previousExpanded.current = expanded;
  }, [expanded]);

  const toggleLabel = expanded
    ? "Hide props"
    : `View ${props.length} props`;

  const handleToggle = () => {
    setExpanded((current) => !current);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="space-y-[var(--space-3)]"
    >
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <SectionHeading id={headingId}>Props</SectionHeading>
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className={cn(
            "text-label font-medium text-foreground",
            "underline-offset-4 transition hover:underline",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]",
          )}
        >
          {toggleLabel}
        </button>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!expanded}
        aria-hidden={expanded ? undefined : true}
        className="overflow-x-auto rounded-card r-card-md border border-card-hairline-60 bg-surface-2/60 shadow-[var(--shadow-inset-hairline)]"
      >
        <table className="w-full min-w-[calc(var(--space-8)*7)] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-label text-muted-foreground">
              <th scope="col" className="px-[var(--space-4)] py-[var(--space-3)] font-semibold">
                Prop
              </th>
              <th scope="col" className="px-[var(--space-4)] py-[var(--space-3)] font-semibold">
                Type
              </th>
              <th scope="col" className="px-[var(--space-4)] py-[var(--space-3)] font-semibold">
                Default
              </th>
              <th scope="col" className="px-[var(--space-4)] py-[var(--space-3)] font-semibold">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop, index) => (
              <tr
                key={prop.name}
                className="border-t border-card-hairline-40 text-label"
              >
                <td
                  ref={index === 0 ? firstCellRef : undefined}
                  tabIndex={index === 0 ? -1 : undefined}
                  className="px-[var(--space-4)] py-[var(--space-3)] font-medium text-foreground"
                >
                  {prop.name}
                  {prop.required ? (
                    <span className="ml-[var(--space-2)] text-caption text-danger">
                      Required
                    </span>
                  ) : null}
                </td>
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-label text-muted-foreground">
                  <code className="whitespace-pre">
                    {prop.type}
                  </code>
                </td>
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-label text-muted-foreground">
                  {prop.defaultValue ?? "—"}
                </td>
                <td className="px-[var(--space-4)] py-[var(--space-3)] text-label text-muted-foreground">
                  {prop.description ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VariantsMatrix({ axes }: { axes: readonly GalleryAxis[] }) {
  const headingId = React.useId();

  if (axes.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="space-y-[var(--space-3)]"
    >
      <SectionHeading id={headingId}>Variants</SectionHeading>
      <div className="grid gap-[var(--space-3)] md:grid-cols-2">
        {axes.map((axis) => (
          <article
            key={axis.id}
            className="rounded-card r-card-md border border-card-hairline-60 bg-surface-2/60 p-[var(--space-4)] shadow-[var(--shadow-inset-hairline)]"
          >
            <div className="space-y-[var(--space-1)]">
              <h4 className="text-ui font-semibold tracking-[-0.01em] text-foreground">
                {axis.label}
              </h4>
              {axis.description ? (
                <p className="text-caption text-muted-foreground">
                  {axis.description}
                </p>
              ) : null}
            </div>
            <ul className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-2)]">
              {axis.values.map((value) => (
                <li key={value.value} className="flex flex-col gap-[var(--space-1)]">
                  <Badge tone="support" size="md" className="text-muted-foreground">
                    {value.value}
                  </Badge>
                  {value.description ? (
                    <span className="text-caption text-muted-foreground">
                      {value.description}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

interface IssuesSectionProps {
  readonly issues: readonly ComponentIssue[];
  readonly panelId: string;
  readonly badgeId: string;
  readonly expanded: boolean;
  readonly onToggle: () => void;
}

function IssuesSection({
  issues,
  panelId,
  badgeId,
  expanded,
  onToggle,
}: IssuesSectionProps) {
  const headingId = React.useId();
  const issueCount = issues.length;
  const hasIssues = issueCount > 0;
  const labelledBy = `${headingId} ${badgeId}`;

  const severity: IssueBadgeSeverity = hasIssues
    ? issues.some((issue) => issue.severity === "high")
      ? "critical"
      : issues.some((issue) => issue.severity === "medium")
        ? "warning"
        : "info"
    : "success";

  const badgeLabel = hasIssues
    ? `${issueCount} open ${issueCount === 1 ? "issue" : "issues"}`
    : "All clear";

  return (
    <section aria-labelledby={headingId} className="space-y-[var(--space-3)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <SectionHeading id={headingId}>Known issues</SectionHeading>
        <IssueBadge
          id={badgeId}
          targetId={panelId}
          expanded={expanded}
          severity={severity}
          onClick={onToggle}
        >
          {badgeLabel}
        </IssueBadge>
      </div>
      <div
        id={panelId}
        role="region"
        aria-labelledby={labelledBy}
        hidden={!expanded}
        aria-hidden={expanded ? undefined : true}
        className="rounded-card r-card-md border border-card-hairline-60 bg-surface-2/60 p-[var(--space-4)] shadow-[var(--shadow-inset-hairline)]"
      >
        {hasIssues ? (
          <ul className="space-y-[var(--space-3)]">
            {issues.map((issue) => (
              <li key={issue.id}>
                <IssueCard issue={issue} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-label text-muted-foreground">
            No open issues logged for this spec.
          </p>
        )}
      </div>
    </section>
  );
}

type IssueCardProps = {
  readonly issue: ComponentIssue;
};

const ISSUE_SEVERITY_LABEL: Record<ComponentIssueSeverity, string> = {
  low: "Low impact",
  medium: "Medium impact",
  high: "High impact",
};

const ISSUE_SEVERITY_CLASS: Record<ComponentIssueSeverity, string> = {
  low: "border-accent/40 bg-accent/15 text-accent-foreground",
  medium: "border-warning/45 bg-warning/15 text-warning-foreground",
  high: "border-danger/45 bg-danger/18 text-danger-foreground",
};

const ISSUE_STATUS_LABEL: Record<ComponentIssueStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  blocked: "Blocked",
  resolved: "Resolved",
};

function IssueCard({ issue }: IssueCardProps) {
  const severityLabel = ISSUE_SEVERITY_LABEL[issue.severity];
  const statusLabel = ISSUE_STATUS_LABEL[issue.status];
  const severityChipClass = ISSUE_SEVERITY_CLASS[issue.severity];

  return (
    <article className="space-y-[var(--space-2)] rounded-card r-card-md border border-card-hairline-60 bg-card/80 p-[var(--space-4)] text-card-foreground shadow-depth-outer">
      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-[var(--space-2)] py-[var(--space-1)] text-caption font-semibold uppercase tracking-[0.12em]",
            severityChipClass,
          )}
        >
          {severityLabel}
        </span>
        <span className="text-label text-muted-foreground">{statusLabel}</span>
        {issue.link ? (
          <a
            href={issue.link}
            target="_blank"
            rel="noreferrer"
            className="text-label font-medium text-accent-foreground underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]"
          >
            View discussion
          </a>
        ) : null}
      </div>
      <h4 className="text-ui font-semibold tracking-[-0.01em] text-foreground">
        {issue.title}
      </h4>
      <p className="text-label text-muted-foreground">{issue.summary}</p>
    </article>
  );
}

type UsageNotes = NonNullable<GallerySerializableEntry["usage"]>;

function UsageSection({ notes }: { notes: UsageNotes }) {
  const headingId = React.useId();

  if (notes.length === 0) {
    return null;
  }

  const doNotes = notes.filter((note) => note.kind === "do");
  const dontNotes = notes.filter((note) => note.kind === "dont");

  return (
    <section
      aria-labelledby={headingId}
      className="space-y-[var(--space-3)]"
    >
      <SectionHeading id={headingId}>Usage</SectionHeading>
      <div className="grid gap-[var(--space-4)] md:grid-cols-2">
        {doNotes.length > 0 ? (
          <div className="space-y-[var(--space-2)]">
            <h4 className="text-ui font-semibold tracking-[-0.01em] text-success">
              Do
            </h4>
            <ul className="space-y-[var(--space-2)]">
              {doNotes.map((note) => (
                <li key={note.title} className="space-y-[var(--space-1)]">
                  <p className="text-label font-medium text-foreground">
                    {note.title}
                  </p>
                  <p className="text-label text-muted-foreground">
                    {note.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {dontNotes.length > 0 ? (
          <div className="space-y-[var(--space-2)]">
            <h4 className="text-ui font-semibold tracking-[-0.01em] text-danger">
              Don’t
            </h4>
            <ul className="space-y-[var(--space-2)]">
              {dontNotes.map((note) => (
                <li key={note.title} className="space-y-[var(--space-1)]">
                  <p className="text-label font-medium text-foreground">
                    {note.title}
                  </p>
                  <p className="text-label text-muted-foreground">
                    {note.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SurfaceGroup({
  label,
  surfaces,
  badgeLabel,
  badgeClassName,
  descriptionForSurface,
}: {
  label: string;
  surfaces: readonly GalleryRelatedSurface[];
  badgeLabel: (surface: GalleryRelatedSurface) => React.ReactNode;
  badgeClassName?: string;
  descriptionForSurface?: (surface: GalleryRelatedSurface) =>
    | string
    | undefined;
}) {
  return (
    <div className="space-y-[var(--space-2)]">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <ul className="flex flex-wrap gap-[var(--space-2)]">
        {surfaces.map((surface) => {
          const description = descriptionForSurface?.(surface)
            ?? surface.description;
          return (
            <li key={surface.id} className="flex flex-col gap-[var(--space-1)]">
              <Badge
                tone="support"
                size="md"
                className={cn("text-muted-foreground", badgeClassName)}
              >
                {badgeLabel(surface)}
              </Badge>
              {description ? (
                <span className="text-caption text-muted-foreground">
                  {description}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UsedOnSection({
  surfaces,
}: {
  surfaces: readonly GalleryRelatedSurface[] | undefined;
}) {
  const headingId = React.useId();

  const relatedSurfaces = React.useMemo(
    () => surfaces ?? [],
    [surfaces],
  );
  const pageSurfaces = React.useMemo(
    () =>
      relatedSurfaces.filter((surface) => surface.id.startsWith("/")),
    [relatedSurfaces],
  );
  const sharedSurfaces = React.useMemo(
    () =>
      relatedSurfaces.filter((surface) => !surface.id.startsWith("/")),
    [relatedSurfaces],
  );

  const hasSpecificSurfaces =
    pageSurfaces.length > 0 || sharedSurfaces.length > 0;

  return (
    <section
      aria-labelledby={headingId}
      className="space-y-[var(--space-3)]"
    >
      <SectionHeading id={headingId}>Used on</SectionHeading>
      {hasSpecificSurfaces ? (
        <div className="rounded-card r-card-md border border-card-hairline-60 bg-surface-2/60 p-[var(--space-4)] shadow-[var(--shadow-inset-hairline)]">
          <div
            className={cn(
              "space-y-[var(--space-4)]",
              pageSurfaces.length > 0 &&
                sharedSurfaces.length > 0 &&
                "md:grid md:grid-cols-2 md:gap-[var(--space-4)] md:space-y-0",
            )}
          >
            {pageSurfaces.length > 0 ? (
              <SurfaceGroup
                label="Pages"
                surfaces={pageSurfaces}
                badgeClassName="font-mono"
                badgeLabel={(surface) => surface.id}
              />
            ) : null}
            {sharedSurfaces.length > 0 ? (
              <SurfaceGroup
                label="Global"
                surfaces={sharedSurfaces}
                badgeLabel={(surface) => surface.description ?? surface.id}
                descriptionForSurface={(surface) =>
                  surface.description ? surface.id : undefined
                }
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-[var(--space-3)] rounded-card r-card-md border border-card-hairline-60 bg-surface-2/60 p-[var(--space-4)] text-label text-muted-foreground shadow-[var(--shadow-inset-hairline)]">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            <Badge tone="support" size="md" className="text-muted-foreground">
              Global
            </Badge>
          </div>
          <p>
            No page placements yet. This component is available across Planner.
          </p>
        </div>
      )}
    </section>
  );
}

interface StatesSectionProps {
  states: readonly GallerySerializableStateDefinition[];
  stateAxes: readonly GalleryAxis[];
  activeSnippet: string | null;
  onToggleState: (stateId: string) => void;
}

function StatesSection({
  states,
  stateAxes,
  activeSnippet,
  onToggleState,
}: StatesSectionProps) {
  const headingId = React.useId();

  if (states.length === 0 && stateAxes.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="space-y-[var(--space-3)]"
    >
      <SectionHeading id={headingId}>States</SectionHeading>
      {stateAxes.length > 0 ? (
        <div className="rounded-card r-card-md border border-card-hairline-60 bg-surface-2/60 p-[var(--space-4)] shadow-[var(--shadow-inset-hairline)]">
          <div className="grid gap-[var(--space-3)] md:grid-cols-2">
            {stateAxes.map((axis) => (
              <div key={axis.id} className="space-y-[var(--space-2)]">
                <p className="text-label font-medium text-muted-foreground">
                  {axis.label}
                </p>
                <ul className="flex flex-wrap gap-[var(--space-2)]">
                  {axis.values.map((value) => (
                    <li key={value.value}>
                      <Badge tone="support" size="md" className="text-muted-foreground">
                        {value.value}
                      </Badge>
                    </li>
                  ))}
                </ul>
                {axis.description ? (
                  <p className="text-caption text-muted-foreground">
                    {axis.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {states.length > 0 ? (
        <div className="grid gap-[var(--space-4)] md:grid-cols-2">
          {states.map((state) => {
            const key = `state:${state.id}`;
            return (
              <StatePreviewCard
                key={state.id}
                state={state}
                expanded={activeSnippet === key}
                onToggle={() => onToggleState(state.id)}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function StatePreviewCard({
  state,
  expanded,
  onToggle,
}: {
  state: GallerySerializableStateDefinition;
  expanded: boolean;
  onToggle: () => void;
}) {
  const headingId = React.useId();
  const descriptionId = state.description
    ? `${headingId}-description`
    : undefined;
  const codeId = React.useId();

  const previewRenderer = React.useMemo(
    () => getGalleryPreview(state.preview.id),
    [state.preview.id],
  );

  const previewNode = React.useMemo(() => {
    if (!previewRenderer) {
      return (
        <div className="text-ui text-muted-foreground">Preview unavailable</div>
      );
    }
    return (
      <React.Suspense fallback={<GalleryPreviewFallback />}>
        {previewRenderer()}
      </React.Suspense>
    );
  }, [previewRenderer]);

  return (
    <article
      className="flex flex-col gap-[var(--space-3)] rounded-card r-card-lg border border-card-hairline-60 bg-panel-tilt-muted p-[var(--space-4)] shadow-depth-outer"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <header className="flex items-start justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          <h4
            id={headingId}
            className="text-ui font-semibold tracking-[-0.01em] text-foreground"
          >
            {state.name}
          </h4>
          {state.description ? (
            <p
              id={descriptionId}
              className="text-label text-muted-foreground"
            >
              {state.description}
            </p>
          ) : null}
        </div>
        {state.code ? (
          <ShowCodeButton
            controls={codeId}
            expanded={expanded}
            onToggle={onToggle}
          />
        ) : null}
      </header>
      <div className={frameClassName}>{previewNode}</div>
      {state.code ? (
        <pre
          id={codeId}
          hidden={!expanded}
          aria-hidden={expanded ? undefined : true}
          className="rounded-card r-card-md bg-muted/80 p-[var(--space-4)] text-label shadow-[var(--shadow-inset-hairline)]"
        >
          <code>{state.code}</code>
        </pre>
      ) : null}
    </article>
  );
}

export default function ComponentsView({
  entry,
  onCurrentCodeChange,
}: ComponentsViewProps) {
  const previewRenderer = React.useMemo(
    () => getGalleryPreview(entry.preview.id),
    [entry.preview.id],
  );

  const variantAxes = React.useMemo(
    () => entry.axes?.filter((axis) => axis.type === "variant") ?? [],
    [entry.axes],
  );

  const stateAxes = React.useMemo(
    () => entry.axes?.filter((axis) => axis.type === "state") ?? [],
    [entry.axes],
  );

  const states = React.useMemo(
    () => entry.states ?? [],
    [entry.states],
  );

  const usage = entry.usage ?? [];

  const [openSnippet, setOpenSnippet] = React.useState<string | null>(null);

  const issues = React.useMemo(
    () => getComponentIssues(entry.id),
    [entry.id],
  );
  const issueCount = issues.length;
  const [issuesExpanded, setIssuesExpanded] = React.useState(issueCount > 0);
  const issuePanelId = React.useMemo(
    () => `${entry.id}-issues-panel`,
    [entry.id],
  );
  const issueBadgeId = `${issuePanelId}-badge`;

  React.useEffect(() => {
    setOpenSnippet(null);
  }, [entry.id]);

  React.useEffect(() => {
    setIssuesExpanded(issueCount > 0);
  }, [entry.id, issueCount]);

  const stateMap = React.useMemo(() => {
    const map = new Map<string, GallerySerializableStateDefinition>();
    for (const state of states) {
      map.set(`state:${state.id}`, state);
    }
    return map;
  }, [states]);

  const currentCode = React.useMemo(() => {
    if (!openSnippet) {
      return null;
    }
    if (openSnippet === "component") {
      return entry.code ?? null;
    }
    return stateMap.get(openSnippet)?.code ?? null;
  }, [entry.code, openSnippet, stateMap]);

  React.useEffect(() => {
    if (!onCurrentCodeChange) {
      return;
    }
    onCurrentCodeChange(currentCode ?? null);
  }, [currentCode, onCurrentCodeChange]);

  const handleToggleMainCode = React.useCallback(() => {
    if (!entry.code) {
      return;
    }
    setOpenSnippet((current) =>
      current === "component" ? null : "component",
    );
  }, [entry.code]);

  const handleToggleStateCode = React.useCallback(
    (stateId: string) => {
      const key = `state:${stateId}`;
      const state = stateMap.get(key);
      if (!state?.code) {
        return;
      }
      setOpenSnippet((current) => (current === key ? null : key));
    },
    [stateMap],
  );

  const componentCodeId = React.useMemo(
    () => `${entry.id}-code`,
    [entry.id],
  );

  return (
    <article className={containerClassName}>
      <header className="flex flex-wrap items-start justify-between gap-[var(--space-4)]">
        <div className="flex-1 space-y-[var(--space-2)]">
          <h2 className="text-title font-semibold tracking-[-0.01em] text-foreground">
            {entry.name}
          </h2>
          {entry.description ? (
            <p className="text-ui text-muted-foreground">
              {entry.description}
            </p>
          ) : null}
          {entry.tags && entry.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-[var(--space-2)]">
              {entry.tags.map((tag) => (
                <li key={tag}>
                  <Badge
                    tone="support"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {entry.code ? (
          <ShowCodeButton
            controls={componentCodeId}
            expanded={openSnippet === "component"}
            onToggle={handleToggleMainCode}
          />
        ) : null}
      </header>
      <IssuesSection
        issues={issues}
        panelId={issuePanelId}
        badgeId={issueBadgeId}
        expanded={issuesExpanded}
        onToggle={() => setIssuesExpanded((prev) => !prev)}
      />
      <ThemeMatrix entryId={entry.id} previewRenderer={previewRenderer} />
      {entry.code ? (
        <pre
          id={componentCodeId}
          hidden={openSnippet !== "component"}
          aria-hidden={openSnippet === "component" ? undefined : true}
          className="rounded-card r-card-md bg-muted/80 p-[var(--space-4)] text-label shadow-[var(--shadow-inset-hairline)]"
        >
          <code>{entry.code}</code>
        </pre>
      ) : null}
      {entry.props && entry.props.length > 0 ? (
        <PropsTable props={entry.props} />
      ) : null}
      {variantAxes.length > 0 ? <VariantsMatrix axes={variantAxes} /> : null}
      <StatesSection
        states={states}
        stateAxes={stateAxes}
        activeSnippet={openSnippet}
        onToggleState={handleToggleStateCode}
      />
      <UsedOnSection surfaces={entry.related?.surfaces} />
      <UsageSection notes={usage} />
    </article>
  );
}
