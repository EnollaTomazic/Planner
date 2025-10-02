"use client";

import * as React from "react";

import { ThemeMatrix } from "@/components/prompts/ComponentsView";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  NeoCard,
  SectionCard,
  SectionCardBody,
  SectionCardHeader,
  Skeleton,
  Button,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type CardStateId = "default" | "hover" | "active" | "disabled" | "loading";

interface CardPreviewState {
  readonly id: CardStateId;
  readonly name: string;
  readonly render: () => React.ReactNode;
}

interface CardPreviewSpec {
  readonly id: string;
  readonly heading: string;
  readonly copy: string;
  readonly states: readonly CardPreviewState[];
}

export const CARD_PREVIEW_REQUIRED_STATE_IDS: readonly CardStateId[] = [
  "default",
  "hover",
  "active",
  "disabled",
  "loading",
];

const cardBodyClassName = "space-y-[var(--space-3)]";
const cardMetaClassName = "space-y-[var(--space-1)]";

const StandardCardHeading = () => (
  <div className={cardMetaClassName}>
    <CardTitle>Weekly recap</CardTitle>
    <CardDescription>
      Curate stats, goals, and notes for squads reviewing past scrims.
    </CardDescription>
  </div>
);

const StandardCardContent = () => (
  <CardContent className="space-y-[var(--space-2)]">
    <p className="text-label text-muted-foreground">
      Theme tokens drive the border, hover overlay, and pressed shadows so cards stay
      legible across Planner variants.
    </p>
  </CardContent>
);

const StandardCardFooter = () => (
  <CardFooter className="justify-end gap-[var(--space-2)]">
    <Button size="sm" variant="quiet">
      Dismiss
    </Button>
    <Button size="sm">Open recap</Button>
  </CardFooter>
);

const createStandardCard = (
  className: string,
  options?: { disabled?: boolean; loading?: boolean },
) => {
  const { disabled = false, loading = false } = options ?? {};
  return (
    <Card
      aria-disabled={disabled ? true : undefined}
      aria-busy={loading ? true : undefined}
      className={cn(cardBodyClassName, className)}
    >
      <CardHeader className={cardMetaClassName}>
        <StandardCardHeading />
      </CardHeader>
      <StandardCardContent />
      {loading ? (
        <CardContent className="space-y-[var(--space-2)]">
          <Skeleton className="h-[var(--space-5)] w-3/4" radius="sm" />
          <Skeleton className="h-[var(--space-5)] w-full" radius="sm" />
        </CardContent>
      ) : (
        <StandardCardFooter />
      )}
    </Card>
  );
};

const standardCardStates: readonly CardPreviewState[] = [
  {
    id: "default",
    name: "Default",
    render: () =>
      createStandardCard(
        "shadow-depth-soft border border-card-hairline/70 bg-card/80",
      ),
  },
  {
    id: "hover",
    name: "Hover",
    render: () =>
      createStandardCard(
        "shadow-ring border border-ring/60 bg-card",
      ),
  },
  {
    id: "active",
    name: "Active",
    render: () =>
      createStandardCard(
        "shadow-depth-outer-strong border border-ring ring-2 ring-ring ring-offset-2 ring-offset-[hsl(var(--card))]",
      ),
  },
  {
    id: "disabled",
    name: "Disabled",
    render: () =>
      createStandardCard(
        "pointer-events-none border border-border/60 bg-muted/25 opacity-55 shadow-none",
        { disabled: true },
      ),
  },
  {
    id: "loading",
    name: "Loading",
    render: () =>
      createStandardCard(
        "border border-ring/40 bg-card/90 shadow-outline-faint",
        { loading: true },
      ),
  },
];

const createNeoCard = (
  className: string,
  options?: { disabled?: boolean; loading?: boolean },
) => {
  const { disabled = false, loading = false } = options ?? {};
  return (
    <NeoCard
      aria-disabled={disabled ? true : undefined}
      aria-busy={loading ? true : undefined}
      className={cn(
        "space-y-[var(--space-3)] p-[var(--space-4)]",
        className,
      )}
    >
      <div className={cardMetaClassName}>
        <h3 className="text-ui font-semibold tracking-[-0.01em]">
          Neo card summary
        </h3>
        <p className="text-label text-muted-foreground">
          High-contrast overlay and neon accents surface quick wins.
        </p>
      </div>
      {loading ? (
        <div className="space-y-[var(--space-2)]">
          <Skeleton className="h-[var(--space-5)] w-full" radius="sm" />
          <Skeleton className="h-[var(--space-5)] w-4/5" radius="sm" />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-[var(--space-2)]">
          <p className="text-label text-muted-foreground">
            Overlay respects glitch opacity tokens per theme.
          </p>
          <Button size="sm" variant="neo">
            View overlay
          </Button>
        </div>
      )}
    </NeoCard>
  );
};

const neoCardStates: readonly CardPreviewState[] = [
  {
    id: "default",
    name: "Default",
    render: () =>
      createNeoCard("[box-shadow:var(--depth-shadow-soft)] border-card-hairline/70"),
  },
  {
    id: "hover",
    name: "Hover",
    render: () =>
      createNeoCard(
        "shadow-ring border-ring/60 bg-card/95",
      ),
  },
  {
    id: "active",
    name: "Active",
    render: () =>
      createNeoCard(
        "shadow-depth-outer-strong border-ring ring-2 ring-accent/80",
      ),
  },
  {
    id: "disabled",
    name: "Disabled",
    render: () =>
      createNeoCard(
        "pointer-events-none border-border/50 bg-muted/30 opacity-55 shadow-none",
        { disabled: true },
      ),
  },
  {
    id: "loading",
    name: "Loading",
    render: () =>
      createNeoCard(
        "border-ring/40 bg-card/90 shadow-outline-faint",
        { loading: true },
      ),
  },
];

const createSectionCard = (
  className: string,
  options?: { disabled?: boolean; loading?: boolean },
) => {
  const { disabled = false, loading = false } = options ?? {};
  return (
    <SectionCard
      aria-disabled={disabled ? true : undefined}
      aria-busy={loading ? true : undefined}
      className={cn("space-y-[var(--space-3)]", className)}
    >
      <SectionCardHeader className={cardMetaClassName}>
        <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Planner surface
        </p>
        <h3 className="text-ui font-semibold tracking-[-0.01em]">
          Section card shell
        </h3>
      </SectionCardHeader>
      <SectionCardBody className="space-y-[var(--space-2)] text-label text-muted-foreground">
        {loading ? (
          <>
            <Skeleton className="h-[var(--space-5)] w-4/5" radius="sm" />
            <Skeleton className="h-[var(--space-5)] w-full" radius="sm" />
          </>
        ) : (
          <>
            <p>
              Section cards stage layout-level content with sticky headers and panel
              spacing tuned to Planner shell breakpoints.
            </p>
            <Button size="sm" variant="quiet">
              Inspect layout
            </Button>
          </>
        )}
      </SectionCardBody>
    </SectionCard>
  );
};

const sectionCardStates: readonly CardPreviewState[] = [
  {
    id: "default",
    name: "Default",
    render: () =>
      createSectionCard(
        "shadow-depth-soft border border-card-hairline/70 bg-panel/75",
      ),
  },
  {
    id: "hover",
    name: "Hover",
    render: () =>
      createSectionCard(
        "shadow-ring border border-ring/60 bg-panel",
      ),
  },
  {
    id: "active",
    name: "Active",
    render: () =>
      createSectionCard(
        "shadow-depth-outer-strong border border-ring ring-2 ring-ring",
      ),
  },
  {
    id: "disabled",
    name: "Disabled",
    render: () =>
      createSectionCard(
        "pointer-events-none border border-border/60 bg-muted/20 opacity-55 shadow-none",
        { disabled: true },
      ),
  },
  {
    id: "loading",
    name: "Loading",
    render: () =>
      createSectionCard(
        "border border-ring/40 bg-panel/85 shadow-outline-faint",
        { loading: true },
      ),
  },
];

const CARD_PREVIEW_SPECS: readonly CardPreviewSpec[] = [
  {
    id: "card",
    heading: "Card",
    copy: "Baseline surface used throughout Planner lists and dashboards.",
    states: standardCardStates,
  },
  {
    id: "neo-card",
    heading: "Neo card",
    copy: "Accent overlay variant for high-signal summaries.",
    states: neoCardStates,
  },
  {
    id: "section-card",
    heading: "Section card",
    copy: "Layout-level surface with sticky headers and panel spacing.",
    states: sectionCardStates,
  },
];

export const CARD_CONTROL_STATE_IDS: Record<string, readonly CardStateId[]> =
  Object.fromEntries(
    CARD_PREVIEW_SPECS.map((spec) => [spec.id, spec.states.map((state) => state.id)]),
  );

const figureClassName =
  "flex flex-col items-center gap-[var(--space-2)] text-center";
const surfaceWrapperClassName = cn(
  "w-full rounded-card border border-card-hairline/60 bg-card/70 p-[var(--space-3)]",
  "shadow-depth-soft",
);

function CardsPreview() {
  return (
    <div className="space-y-[var(--space-6)]">
      {CARD_PREVIEW_SPECS.map((spec) => (
        <section key={spec.id} aria-labelledby={`${spec.id}-preview-heading`}>
          <header className="space-y-[var(--space-1)]">
            <h2
              id={`${spec.id}-preview-heading`}
              className="text-subhead font-semibold tracking-[-0.01em]"
            >
              {spec.heading}
            </h2>
            <p className="text-label text-muted-foreground">{spec.copy}</p>
          </header>
          <div className="grid gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-3">
            {spec.states.map((state) => (
              <figure key={state.id} className={figureClassName}>
                <div className={surfaceWrapperClassName}>{state.render()}</div>
                <figcaption className="text-label text-muted-foreground">
                  {state.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function CardsPreviewMatrixClient() {
  const previewRenderer = React.useMemo(() => {
    const Renderer = () => <CardsPreview />;
    Renderer.displayName = "CardsPreviewRenderer";
    return Renderer;
  }, []);

  return (
    <div className="space-y-[var(--space-5)]">
      <ThemeMatrix
        entryId="gallery-cards-preview"
        previewRenderer={previewRenderer}
      />
    </div>
  );
}
