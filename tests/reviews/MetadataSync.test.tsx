import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import ResultScoreSection from "@/components/reviews/ResultScoreSection";
import PillarsSelector from "@/components/reviews/PillarsSelector";
import TimestampMarkers from "@/components/reviews/TimestampMarkers";
import type { ReviewMarker } from "@/lib/types";

vi.mock("@/components/ui/league/pillars/PillarBadge", () => ({
  __esModule: true,
  default: ({ pillar, active }: { pillar: string; active: boolean }) => (
    <span>{`${pillar}${active ? " (active)" : ""}`}</span>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Review metadata controls", () => {
  it("updates result and score when props change", async () => {
    const commitMeta = vi.fn();
    const { rerender } = render(
      <ResultScoreSection
        result="Win"
        score={5}
        commitMeta={commitMeta}
      />,
    );

    expect(
      screen.getByRole("switch", { name: "Result" }),
    ).toHaveAttribute("aria-checked", "true");
    const initialSlider = screen.getByLabelText(
      "Score from 0 to 10",
    ) as HTMLInputElement;
    expect(initialSlider.value).toBe("5");

    rerender(
      <ResultScoreSection
        result="Loss"
        score={2}
        commitMeta={commitMeta}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("switch", { name: "Result" }),
      ).toHaveAttribute("aria-checked", "false");
      const slider = screen.getByLabelText(
        "Score from 0 to 10",
      ) as HTMLInputElement;
      expect(slider.value).toBe("2");
    });
  });

  it("updates pillar selection when props change", async () => {
    const commitMeta = vi.fn();
    const { rerender } = render(
      <PillarsSelector pillars={[]} commitMeta={commitMeta} />,
    );

    const waveButton = screen.getByRole("button", { name: /Wave/ });
    expect(waveButton).toHaveAttribute("aria-pressed", "false");

    rerender(
      <PillarsSelector pillars={["Wave"]} commitMeta={commitMeta} />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Wave/ }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("renders incoming markers when props change", async () => {
    const commitMeta = vi.fn();
    const { rerender } = render(
      <TimestampMarkers markers={[]} commitMeta={commitMeta} />,
    );

    expect(screen.getByText("No timestamps yet.")).toBeInTheDocument();

    const markers: ReviewMarker[] = [
      {
        id: "mark-1",
        seconds: 80,
        time: "1:20",
        note: "Mid dive setup",
        noteOnly: false,
      },
    ];

    rerender(
      <TimestampMarkers markers={markers} commitMeta={commitMeta} />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText("No timestamps yet."),
      ).not.toBeInTheDocument();
      expect(screen.getByText("1:20")).toBeInTheDocument();
      expect(screen.getByText("Mid dive setup")).toBeInTheDocument();
    });
  });
});
