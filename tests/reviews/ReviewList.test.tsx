import React from "react";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ReviewList } from "@/components/reviews";
import type { Review } from "@/lib/types";

function makeReviews(count: number): Review[] {
  return Array.from({ length: count }, (_, index) => {
    const id = String(index + 1);
    return {
      id,
      title: `Review ${id}`,
      createdAt: Date.now() - index,
      tags: [],
      pillars: [],
    } satisfies Review;
  });
}

describe("ReviewList", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the expanded view when reviews update without reordering", async () => {
    const base = makeReviews(60);
    const { rerender } = render(
      <ReviewList reviews={base} selectedId={null} />,
    );

    const getItems = () =>
      within(screen.getByRole("list")).getAllByRole("button", {
        name: /Open review:/i,
      });

    expect(getItems()).toHaveLength(40);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() => {
      expect(getItems()).toHaveLength(60);
    });

    const updated = base.map((review, index) => ({
      ...review,
      title: `Updated ${index + 1}`,
    }));

    rerender(<ReviewList reviews={updated} selectedId={null} />);

    await waitFor(() => {
      expect(getItems()).toHaveLength(60);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Load more" }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows onboarding copy when no reviews exist", () => {
    render(<ReviewList reviews={[]} selectedId={null} onCreate={() => {}} />);

    expect(
      screen.getByText("No reviews yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Start by capturing your first match."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start a review" })).toBeInTheDocument();
  });

  it("shows filtered empty message when reviews exist elsewhere", () => {
    render(
      <ReviewList reviews={[]} selectedId={null} hasAnyReviews />,
    );

    expect(
      screen.getByText("No reviews match your search."),
    ).toBeInTheDocument();
    expect(screen.getByText("Clear filters to see everything.")).toBeInTheDocument();
  });
});
