import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
  act,
} from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { ReviewsPage } from "@/components/reviews";
import type { Review } from "@/lib/types";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const baseReviews: Review[] = [
  {
    id: "1",
    title: "Alpha",
    tags: [],
    pillars: [],
    createdAt: 3000,
    matchup: "Lux vs Ahri",
    role: "MID",
  },
  {
    id: "2",
    title: "Beta",
    tags: [],
    pillars: [],
    createdAt: 1000,
    matchup: "Garen vs Darius",
    role: "TOP",
  },
  {
    id: "3",
    title: "Gamma",
    tags: [],
    pillars: [],
    createdAt: 2000,
    matchup: "Ashe vs Cait",
    role: "BOT",
  },
];

describe("ReviewsPage", () => {
  it("renders available reviews with hero subtitle", () => {
    render(
      <ReviewsPage
        reviews={baseReviews}
        selectedId={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onRename={() => {}}
      />,
    );

    expect(
      screen.getByText("Capture match recaps, filter by tags and patches"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Review" })).toBeEnabled();
    const reviewButtons = screen
      .getAllByRole("button", { name: /Open review:/i })
      .map((node) => node.getAttribute("aria-label"));
    expect(reviewButtons).toContain("Open review: Alpha");
    expect(reviewButtons).toContain("Open review: Beta");
    expect(reviewButtons).toContain("Open review: Gamma");
  });

  it("renders loading shimmer when reviews are undefined", () => {
    render(
      <ReviewsPage
        reviews={undefined}
        selectedId={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onRename={() => {}}
      />,
    );

    expect(
      screen.getByRole("status", { name: "Loading review search" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Loading review summary" }),
    ).toBeInTheDocument();
  });

  it("renders fallback error state when reviews resolve to null", () => {
    render(
      <ReviewsPage
        reviews={null}
        selectedId={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onRename={() => {}}
        onRetry={() => {}}
      />,
    );

    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText(/couldn’t load your reviews/i).length,
    ).toBeGreaterThan(0);
    const retryButtons = screen.getAllByRole("button", { name: "Retry sync" });
    expect(retryButtons.length).toBeGreaterThanOrEqual(1);
    retryButtons.forEach((button) => {
      expect(button).toBeEnabled();
    });
  });

  it("renders explicit error message when provided", () => {
    render(
      <ReviewsPage
        reviews={[]}
        error={new Error("Network request failed")}
        selectedId={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onRename={() => {}}
      />,
    );

    expect(
      screen.getAllByText(/Network request failed/i).length,
    ).toBeGreaterThan(0);
    screen
      .getAllByRole("button", { name: "Retry sync" })
      .forEach((button) => {
        expect(button).toBeDisabled();
      });
  });

  it("renders empty dataset call to action", () => {
    render(
      <ReviewsPage
        reviews={[]}
        selectedId={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onRename={() => {}}
      />,
    );

    expect(
      screen.getByText("You’re ready to capture your first review."),
    ).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: "New Review" });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toBeEnabled();
    const searchInput = screen.getByRole("searchbox");
    expect(searchInput).toBeDisabled();
    expect(searchInput).toHaveAttribute(
      "aria-label",
      "Search reviews (disabled until a review exists)",
    );
  });

  it("filters reviews by search query", async () => {
    render(
      <ReviewsPage
        reviews={baseReviews}
        selectedId={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onRename={() => {}}
      />,
    );

    const search = screen.getByRole("searchbox");
    vi.useFakeTimers();
    fireEvent.change(search, { target: { value: "Gamma" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.queryByText("Beta")).toBeNull();
    vi.useRealTimers();
  });

  it("sorts reviews by title", () => {
    render(
      <ReviewsPage
        reviews={baseReviews}
        selectedId={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onRename={() => {}}
      />,
    );

    const list = screen
      .getAllByRole("list")
      .find(
        (candidate) =>
          within(candidate).queryAllByRole("button", { name: /Open review:/i })
            .length > 0,
      );

    expect(list).toBeDefined();

    const getTitles = () =>
      within(list!)
        .getAllByRole("button", { name: /Open review:/i })
        .map((b) => b.getAttribute("aria-label")?.replace("Open review: ", ""));

    expect(getTitles()).toEqual(["Alpha", "Gamma", "Beta"]);

    const sortBtn = screen.getByRole("button", { name: "Sort reviews" });
    fireEvent.click(sortBtn);
    fireEvent.click(screen.getByRole("option", { name: "Title" }));

    expect(getTitles()).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("creates a new review and opens editor", () => {
    function Harness({ onCreate }: { onCreate: () => void }) {
      const [reviews, setReviews] = React.useState<Review[]>(baseReviews);
      const [selectedId, setSelectedId] = React.useState<string | null>(null);
      return (
        <ReviewsPage
          reviews={reviews}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => {
            onCreate();
            const next: Review = {
              id: "4",
              title: "New Review",
              tags: [],
              pillars: [],
              createdAt: 4000,
            };
            setReviews((r) => [...r, next]);
            setSelectedId(next.id);
          }}
          onRename={() => {}}
        />
      );
    }

    const createSpy = vi.fn();
    render(<Harness onCreate={createSpy} />);

    fireEvent.click(screen.getByRole("button", { name: "New Review" }));
    expect(createSpy).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("toggles between summary and edit panels", () => {
    function Harness() {
      const [selectedId, setSelectedId] = React.useState<string>("1");
      return (
        <ReviewsPage
          reviews={baseReviews}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => {}}
          onRename={() => {}}
        />
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Edit review" }));
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("button", { name: "Edit review" })).toBeInTheDocument();
  });
});
