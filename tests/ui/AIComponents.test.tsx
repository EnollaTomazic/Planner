import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  AIAbortButton,
  AIConfidenceHint,
  AIErrorCard,
  AIExplainTooltip,
  AILoadingShimmer,
  AIRetryErrorBubble,
  AITypingIndicator,
} from "@/components/ui/ai";

describe("AIErrorCard", () => {
  it("renders alert semantics and retry action", () => {
    const onRetry = vi.fn();
    render(
      <AIErrorCard
        title="Test error"
        description="Something broke"
        hint="Check network"
        onRetry={onRetry}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Test error");
    expect(alert).toHaveTextContent("Something broke");
    expect(alert).toHaveTextContent("Check network");

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders custom actions when provided", () => {
    const customActionText = "View logs";
    render(
      <AIErrorCard description="Something went wrong" actions={<button>{customActionText}</button>} />,
    );

    expect(screen.getByText(customActionText)).toBeInTheDocument();
  });
});

describe("AILoadingShimmer", () => {
  it("announces loading state and renders the requested line count", () => {
    render(<AILoadingShimmer lines={4} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(/Generating response/i)).toBeInTheDocument();
    const skeletons = status.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });
});

describe("AIAbortButton", () => {
  it("disables the button when not busy", () => {
    const onAbort = vi.fn();
    render(<AIAbortButton onAbort={onAbort} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("invokes onAbort when busy", () => {
    const onAbort = vi.fn();
    render(<AIAbortButton onAbort={onAbort} busy />);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(onAbort).toHaveBeenCalledTimes(1);
  });
});

describe("AITypingIndicator", () => {
  it("renders typing dots and snapshot", () => {
    const { container } = render(
      <AITypingIndicator hint="Streaming contextual response">Drafting follow-up</AITypingIndicator>,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status.querySelectorAll("span[aria-hidden='true']").length).toBeGreaterThan(0);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("disables aria-busy when paused", () => {
    render(<AITypingIndicator isTyping={false} showAvatar={false} />);
    const status = screen.getByRole("status");
    expect(status).not.toHaveAttribute("aria-busy");
  });
});

describe("AIRetryErrorBubble", () => {
  it("invokes retry handler and snapshots the layout", () => {
    const onRetry = vi.fn();
    const { container } = render(
      <AIRetryErrorBubble message="The assistant lost connection" onRetry={onRetry} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("AIConfidenceHint", () => {
  it("formats scores and level metadata", () => {
    const { container } = render(
      <AIConfidenceHint
        level="high"
        score={0.9}
        description="Grounding verified"
        formatScore={(value) => `${(value * 100).toFixed(1)} pts`}
      />,
    );

    expect(screen.getByText(/High/i)).toBeInTheDocument();
    expect(screen.getByText(/90.0 pts/)).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("AIExplainTooltip", () => {
  it("toggles open state via click", () => {
    render(
      <AIExplainTooltip
        triggerLabel="Why this rating?"
        explanation="Confidence blends retrieval coverage, grounding matches, and the assistant's self-check heuristics."
      />,
    );

    const trigger = screen.getByRole("button", { name: /why this rating/i });
    fireEvent.click(trigger);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveAttribute("data-state", "open");
    expect(tooltip).toHaveTextContent(/Confidence blends/);
    expect(tooltip).toMatchSnapshot();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(tooltip).toHaveAttribute("data-state", "closed");
  });
});
