"use client";

import * as React from "react";

import { Button } from "@/components/ui";
import {
  AIAbortButton,
  AIConfidenceHint,
  type AIConfidenceLevel,
  AIErrorCard,
  AIExplainTooltip,
  AILoadingShimmer,
  AIRetryErrorBubble,
  AITypingIndicator,
} from "@/components/ui/ai";

export default function AIPreviewClient() {
  const [busy, setBusy] = React.useState(true);
  const [showError, setShowError] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(true);
  const [showTypingAvatar, setShowTypingAvatar] = React.useState(true);
  const [inlineError, setInlineError] = React.useState(true);
  const [confidenceLevel, setConfidenceLevel] = React.useState<AIConfidenceLevel>("medium");
  const [confidenceScore, setConfidenceScore] = React.useState(0.62);

  const handleAbort = React.useCallback(() => {
    setBusy(false);
    setShowError(true);
    setIsTyping(false);
    setInlineError(true);
  }, []);

  const handleRetry = React.useCallback(() => {
    setBusy(true);
    setShowError(false);
    setInlineError(false);
    setIsTyping(true);
  }, []);

  const cycleConfidence = React.useCallback(() => {
    setConfidenceLevel((previous) => {
      const levels: AIConfidenceLevel[] = ["low", "medium", "high"];
      const currentIndex = levels.indexOf(previous);
      const nextLevel = levels[(currentIndex + 1) % levels.length];
      const scoreByLevel: Record<AIConfidenceLevel, number> = {
        low: 0.28,
        medium: 0.62,
        high: 0.92,
      };
      setConfidenceScore(scoreByLevel[nextLevel]);
      return nextLevel;
    });
  }, []);

  const toggleInlineError = React.useCallback(() => {
    setInlineError((previous) => !previous);
  }, []);

  return (
    <div className="space-y-[var(--space-4)]">
      <section className="space-y-[var(--space-3)]">
        <AITypingIndicator
          isTyping={isTyping}
          showAvatar={showTypingAvatar}
          hint={isTyping ? "Streaming contextual response" : "Paused"}
          className="border border-[hsl(var(--accent-1)/0.3)] bg-[hsl(var(--surface)/0.75)]"
        >
          {isTyping ? "Drafting follow-up" : "Tap resume to continue"}
        </AITypingIndicator>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={() => setIsTyping((previous) => !previous)}
            className="px-[var(--space-3)]"
          >
            {isTyping ? "Pause typing" : "Resume typing"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={() => setShowTypingAvatar((previous) => !previous)}
            className="px-[var(--space-3)]"
          >
            {showTypingAvatar ? "Hide avatar" : "Show avatar"}
          </Button>
        </div>
      </section>

      <AILoadingShimmer
        lines={4}
        label={busy ? "Generating response…" : "Stream paused"}
        className="border border-card-hairline/50 bg-card/55"
      >
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <AIAbortButton onAbort={handleAbort} busy={busy} />
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={() => setBusy((prev) => !prev)}
            className="px-[var(--space-3)]"
          >
            {busy ? "Pause preview" : "Resume preview"}
          </Button>
        </div>
      </AILoadingShimmer>

      <section className="space-y-[var(--space-3)]">
        <AIConfidenceHint
          level={confidenceLevel}
          score={confidenceScore}
          description={confidenceDescriptions[confidenceLevel]}
        >
          <AIExplainTooltip
            triggerLabel="Why this rating?"
            explanation="Confidence blends retrieval coverage, grounding matches, and the assistant's self-check heuristics."
            shortcutHint="Use ⌘· to open the trace inspector."
            tone="neutral"
            triggerProps={{ size: "sm", variant: "quiet" }}
          />
        </AIConfidenceHint>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={cycleConfidence}
            className="px-[var(--space-3)]"
          >
            Cycle confidence
          </Button>
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={() => setConfidenceScore((value) => Math.min(1, Math.max(0, Number((value + 0.08).toFixed(2)))))}
            className="px-[var(--space-3)]"
          >
            Boost score
          </Button>
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={() => setConfidenceScore((value) => Math.max(0, Number((value - 0.12).toFixed(2))))}
            className="px-[var(--space-3)]"
          >
            Reduce score
          </Button>
        </div>
      </section>

      <section className="space-y-[var(--space-3)]">
        {inlineError ? (
          <AIRetryErrorBubble
            message="The assistant lost connection mid-thought."
            hint="Retry to request a clean draft."
            onRetry={() => {
              setInlineError(false);
              setBusy(true);
            }}
          >
            <AIExplainTooltip
              triggerLabel="See diagnostics"
              explanation="Connection dropped between streaming chunks. We recommend retrying so the assistant can rehydrate context."
              triggerProps={{ size: "sm", variant: "quiet" }}
            />
          </AIRetryErrorBubble>
        ) : null}
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            size="sm"
            variant="quiet"
            onClick={toggleInlineError}
            className="px-[var(--space-3)]"
          >
            {inlineError ? "Dismiss inline error" : "Show inline error"}
          </Button>
        </div>
      </section>

      {showError ? (
        <AIErrorCard
          description="The assistant stopped before completing the draft."
          hint="Retry to request a fresh response."
          onRetry={handleRetry}
        />
      ) : null}
    </div>
  );
}

const confidenceDescriptions: Record<AIConfidenceLevel, string> = {
  low: "Grounding is limited, so double-check the assistant before sharing.",
  medium: "Signals look solid with a couple of open questions to verify.",
  high: "The answer matched trusted sources and passed self-checks.",
};
