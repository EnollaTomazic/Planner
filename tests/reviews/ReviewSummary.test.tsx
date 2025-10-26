import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, afterEach, expect } from "vitest";
import { ReviewSummary } from "@/components/reviews";
import type { Review } from "@/lib/types";

describe("ReviewSummary", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders when score and focus include fractional values", () => {
    const review: Review = {
      id: "fractional",
      title: "Fractional Score",
      createdAt: Date.now(),
      tags: [],
      pillars: [],
      score: 7.5,
      focusOn: true,
      focus: 6.2,
    };

    render(<ReviewSummary review={review} />);

    expect(screen.getByText("Fractional Score")).toBeInTheDocument();
    expect(screen.getByText("7.5/10")).toBeInTheDocument();
    expect(screen.getByText("6.2/10")).toBeInTheDocument();
  });
});
