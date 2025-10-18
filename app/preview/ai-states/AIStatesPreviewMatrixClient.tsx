"use client";

import * as React from "react";

import { ThemeMatrix } from "@/components/prompts/ComponentsView";
import { Button } from "@/components/ui";
import {
  AIAbortButton,
  AIConfidenceHint,
  AIErrorCard,
  AIExplainTooltip,
  AILoadingShimmer,
  AIRetryErrorBubble,
  AITypingIndicator,
} from "@/components/ui/ai";
import { cn } from "@/lib/utils";

const noop = () => {};

type AIStateControlId =
  | "ai-typing-indicator"
  | "ai-loading-shimmer"
  | "ai-abort-button"
  | "ai-confidence-hint"
  | "ai-retry-error-bubble"
  | "ai-error-card";

interface AIStateDefinition {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly render: () => React.ReactNode;
}

interface AIStateGroup {
  readonly controlId: AIStateControlId;
  readonly heading: string;
  readonly description: string;
  readonly states: readonly AIStateDefinition[];
}

const stateFigureClassName =
  "flex flex-col items-center gap-[var(--space-2)] text-center";
const stateSurfaceClassName = cn(
  "flex min-h-[var(--space-12)] min-w-[var(--space-12)] items-center justify-center",
  "rounded-card border border-card-hairline/70 bg-card/70 p-[var(--space-3)]",
  "shadow-depth-soft",
  "w-full",
);

export const AI_STATE_GROUPS: readonly AIStateGroup[] = [
  {
    controlId: "ai-typing-indicator",
    heading: "Typing indicator",
    description:
      "Presence indicator states keep users informed while the assistant streams or pauses.",
    states: [
      {
        id: "typing-streaming-avatar",
        name: "Streaming with avatar",
        description: "Default streaming status with assistant avatar visible.",
        render: () => (
          <AITypingIndicator hint="Streaming contextual response">
            Drafting follow-up
          </AITypingIndicator>
        ),
      },
      {
        id: "typing-paused",
        name: "Paused streaming",
        description: "Paused indicator maintains status copy and layout.",
        render: () => (
          <AITypingIndicator isTyping={false} hint="Paused mid-thought">
            Tap resume to continue
          </AITypingIndicator>
        ),
      },
      {
        id: "typing-no-avatar",
        name: "System without avatar",
        description: "Compact indicator without avatar for dense contexts.",
        render: () => (
          <AITypingIndicator showAvatar={false} hint="Gathering teammates">
            Routing to role specialists
          </AITypingIndicator>
        ),
      },
    ],
  },
  {
    controlId: "ai-loading-shimmer",
    heading: "Loading shimmer",
    description:
      "Skeleton streaming surfaces reserve layout while actions remain visible.",
    states: [
      {
        id: "shimmer-streaming",
        name: "Streaming with abort",
        description: "Busy shimmer exposes abort affordance while loading.",
        render: () => (
          <AILoadingShimmer lines={4} label="Generating response…">
            <AIAbortButton busy onAbort={noop} />
          </AILoadingShimmer>
        ),
      },
      {
        id: "shimmer-paused",
        name: "Paused stream",
        description: "Paused shimmer keeps retry control aligned with copy.",
        render: () => (
          <AILoadingShimmer
            lines={3}
            label="Stream paused"
            className="border border-card-hairline/60 bg-card/60"
          >
            <Button
              type="button"
              size="sm"
              variant="quiet"
              className="px-[var(--space-3)]"
            >
              Resume stream
            </Button>
          </AILoadingShimmer>
        ),
      },
      {
        id: "shimmer-no-avatar",
        name: "System without avatar",
        description: "Avatarless shimmer keeps width stable for inline placements.",
        render: () => (
          <AILoadingShimmer
            showAvatar={false}
            lines={3}
            label="Scouting supporting data"
          >
            <p className="text-caption text-muted-foreground">
              Pulling playbook references…
            </p>
          </AILoadingShimmer>
        ),
      },
    ],
  },
  {
    controlId: "ai-abort-button",
    heading: "Abort button",
    description:
      "Abort affordances surface when streaming is active and disable when idle.",
    states: [
      {
        id: "abort-busy",
        name: "Busy state",
        description: "Active abort button uses danger tone for clarity.",
        render: () => <AIAbortButton busy onAbort={noop} />, 
      },
      {
        id: "abort-idle",
        name: "Idle lockout",
        description: "Idle state disables the control once streaming finishes.",
        render: () => <AIAbortButton busy={false} onAbort={noop} />, 
      },
      {
        id: "abort-custom-label",
        name: "Custom label",
        description: "Custom label keeps tone and icon alignment intact.",
        render: () => (
          <AIAbortButton busy onAbort={noop} className="w-full justify-center">
            Stop stream
          </AIAbortButton>
        ),
      },
    ],
  },
  {
    controlId: "ai-confidence-hint",
    heading: "Confidence hint",
    description:
      "Confidence levels highlight evaluation results with tone-aware framing.",
    states: [
      {
        id: "confidence-low",
        name: "Low confidence",
        description: "Low scores highlight caution with danger tone.",
        render: () => (
          <AIConfidenceHint
            level="low"
            score={0.28}
            description="Responses rely on limited retrieval matches; verify manually before sharing."
          />
        ),
      },
      {
        id: "confidence-medium",
        name: "Medium confidence",
        description: "Medium state pairs tooltip guidance with warning tone.",
        render: () => (
          <AIConfidenceHint
            level="medium"
            score={0.62}
            description="Grounding met review thresholds; spot-check critical calls."
          >
            <AIExplainTooltip
              triggerLabel="See trace"
              explanation="Confidence blends retrieval coverage, grounding matches, and assistant self-check heuristics."
              shortcutHint="Press ⌘· to open the trace inspector."
              tone="neutral"
              triggerProps={{ size: "sm", variant: "quiet" }}
            />
          </AIConfidenceHint>
        ),
      },
      {
        id: "confidence-high",
        name: "High confidence",
        description: "High state affirms alignment with success tone.",
        render: () => (
          <AIConfidenceHint
            level="high"
            score={0.94}
            description="Assistant verified facts across scrim archives and scouting reports."
          >
            <AIExplainTooltip
              triggerLabel="View evidence"
              explanation="Highlights include primary-source match VODs and analyst annotations."
              tone="accent"
              triggerProps={{ size: "sm", variant: "quiet" }}
            />
          </AIConfidenceHint>
        ),
      },
    ],
  },
  {
    controlId: "ai-retry-error-bubble",
    heading: "Retry bubble",
    description:
      "Inline retry messaging keeps teams informed without losing context.",
    states: [
      {
        id: "retry-default",
        name: "Default retry",
        description: "Standard retry bubble anchors messaging with action.",
        render: () => (
          <AIRetryErrorBubble
            message="The assistant lost connection mid-thought."
            hint="Retry to request a clean draft."
            onRetry={noop}
          />
        ),
      },
      {
        id: "retry-with-actions",
        name: "Custom actions",
        description: "Custom actions support escalation workflows.",
        render: () => (
          <AIRetryErrorBubble
            message="We couldn't reach the scrim archive."
            hint="Retry or export the partial plan for manual review."
            actions={
              <div className="flex flex-wrap gap-[var(--space-2)]">
                <Button type="button" size="sm" variant="quiet" tone="danger" className="px-[var(--space-3)]">
                  Retry fetch
                </Button>
                <Button type="button" size="sm" variant="quiet" className="px-[var(--space-3)]">
                  Save draft
                </Button>
              </div>
            }
          >
            <AIExplainTooltip
              triggerLabel="Why this failed"
              explanation="Archive node timed out while syncing. Re-run once the ingest queue clears."
              tone="neutral"
              triggerProps={{ size: "sm", variant: "quiet" }}
            />
          </AIRetryErrorBubble>
        ),
      },
    ],
  },
  {
    controlId: "ai-error-card",
    heading: "Error card",
    description:
      "Structured error cards surface context, guidance, and recovery options.",
    states: [
      {
        id: "error-default",
        name: "Retryable error",
        description: "Default card includes retry affordance with hint copy.",
        render: () => (
          <AIErrorCard
            description="The assistant stopped before completing the draft."
            hint="Retry to request a fresh response."
            onRetry={noop}
          />
        ),
      },
      {
        id: "error-logs",
        name: "Logs and escalation",
        description: "Extended card surfaces additional actions for support teams.",
        render: () => (
          <AIErrorCard
            title="Assistant unavailable"
            description="We can't reach the inference cluster due to scheduled maintenance."
            hint="Retry after verifying system status or send logs to support."
            actions={
              <div className="flex flex-wrap gap-[var(--space-2)]">
                <Button type="button" size="sm" variant="quiet" tone="danger" className="px-[var(--space-3)]">
                  Notify support
                </Button>
                <Button type="button" size="sm" variant="quiet" className="px-[var(--space-3)]">
                  Download logs
                </Button>
              </div>
            }
          >
            <p className="text-caption text-[hsl(var(--danger-foreground)/0.75)]">
              Planned downtime wraps at 14:00 UTC. Retry after confirmation.
            </p>
          </AIErrorCard>
        ),
      },
    ],
  },
];

const AI_CONTROL_STATE_ENTRIES = AI_STATE_GROUPS.map(
  (group): readonly [AIStateControlId, readonly string[]] => [
    group.controlId,
    group.states.map((state) => state.id),
  ],
);

export const AI_CONTROL_STATE_IDS: Record<AIStateControlId, readonly string[]> =
  Object.fromEntries(AI_CONTROL_STATE_ENTRIES) as Record<
    AIStateControlId,
    readonly string[]
  >;

export const AI_CONTROL_REQUIRED_STATE_IDS: Record<AIStateControlId, readonly string[]> = {
  "ai-typing-indicator": [
    "typing-streaming-avatar",
    "typing-paused",
    "typing-no-avatar",
  ],
  "ai-loading-shimmer": [
    "shimmer-streaming",
    "shimmer-paused",
    "shimmer-no-avatar",
  ],
  "ai-abort-button": [
    "abort-busy",
    "abort-idle",
    "abort-custom-label",
  ],
  "ai-confidence-hint": [
    "confidence-low",
    "confidence-medium",
    "confidence-high",
  ],
  "ai-retry-error-bubble": [
    "retry-default",
    "retry-with-actions",
  ],
  "ai-error-card": [
    "error-default",
    "error-logs",
  ],
};

function AIStatesPreview() {
  return (
    <div className="space-y-[var(--space-6)]" data-ai-state-matrix-grid>
      {AI_STATE_GROUPS.map((group) => {
        const headingId = `ai-states-${group.controlId}`;
        return (
          <section
            key={group.controlId}
            aria-labelledby={headingId}
            className="space-y-[var(--space-3)]"
            data-ai-state-group={group.controlId}
          >
            <header className="space-y-[var(--space-1)]">
              <h2
                id={headingId}
                className="text-subhead font-semibold tracking-[-0.01em] text-foreground"
              >
                {group.heading}
              </h2>
              <p className="text-label text-muted-foreground">{group.description}</p>
            </header>
            <div className="grid gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
              {group.states.map((state) => (
                <figure
                  key={state.id}
                  className={stateFigureClassName}
                  data-ai-state-cell={state.id}
                >
                  <div className={stateSurfaceClassName}>{state.render()}</div>
                  <figcaption className="space-y-[var(--space-1)] text-label text-muted-foreground">
                    <span className="block font-medium text-foreground">{state.name}</span>
                    {state.description ? (
                      <span className="block text-caption text-muted-foreground">
                        {state.description}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function AIStatesPreviewMatrixClient() {
  const previewRenderer = React.useMemo(() => {
    const Renderer = () => <AIStatesPreview />;
    Renderer.displayName = "AIStatesPreviewRenderer";
    return Renderer;
  }, []);

  return (
    <div className="space-y-[var(--space-5)]" data-ai-state-matrix>
      <ThemeMatrix
        entryId="gallery-ai-states-preview"
        previewRenderer={previewRenderer}
      />
    </div>
  );
}
