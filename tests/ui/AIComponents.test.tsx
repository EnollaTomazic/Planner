import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AIAbortButton from "@/components/ui/ai/AIAbortButton";
import AIErrorCard from "@/components/ui/ai/AIErrorCard";
import AILoadingShimmer from "@/components/ui/ai/AILoadingShimmer";

describe("AIErrorCard", () => {
  it("renders error copy and triggers retry", () => {
    const onRetry = vi.fn();
    render(<AIErrorCard title="Test error" description="Details" onRetry={onRetry} />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Test error");
    expect(alert).toHaveTextContent("Details");

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("AILoadingShimmer", () => {
  it("announces loading state and renders skeleton placeholders", () => {
    render(<AILoadingShimmer label="Loading" helperText="Streaming" lines={2} />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Loading");
    expect(status).toHaveTextContent("Streaming");
    expect(status.querySelectorAll(".skeleton")).toHaveLength(2);
  });
});

describe("AIAbortButton", () => {
  it("invokes the abort handler when clicked", () => {
    const onAbort = vi.fn();
    render(<AIAbortButton onAbort={onAbort} />);

    fireEvent.click(screen.getByRole("button", { name: /stop response/i }));
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  it("respects the disabled state", () => {
    const onAbort = vi.fn();
    render(<AIAbortButton onAbort={onAbort} disabled />);

    fireEvent.click(screen.getByRole("button", { name: /stop response/i }));
    expect(onAbort).not.toHaveBeenCalled();
  });
});
