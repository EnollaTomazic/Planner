import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AIAbortButton, AIErrorCard, AILoadingShimmer } from "@/components/ui/ai";

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
