import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { ReviewEditor } from "@/components/reviews";
import type { Review } from "@/lib/types";

afterEach(cleanup);

const baseReview: Review = {
  id: "r1",
  title: "Sample Review",
  tags: [],
  pillars: [],
  createdAt: 1700000000000,
};

describe("ReviewEditor", () => {
  it("renders default state", () => {
    const { container } = render(<ReviewEditor review={baseReview} />);
    expect(container).toMatchSnapshot();
  });

  it("commits lane changes", () => {
    const metaSpy = vi.fn();
    const renameSpy = vi.fn();
    render(
      <ReviewEditor
        review={baseReview}
        onChangeMeta={metaSpy}
        onRename={renameSpy}
      />,
    );

    const lane = screen.getByPlaceholderText("Ashe/Lulu") as HTMLInputElement;
    fireEvent.change(lane, { target: { value: "Ashe/Lulu" } });
    fireEvent.blur(lane);

    expect(lane.value).toBe("Ashe/Lulu");
    expect(metaSpy).toHaveBeenCalledWith({ lane: "Ashe/Lulu" });
    expect(renameSpy).toHaveBeenCalledWith("Ashe/Lulu");
  });

  it("toggles pillars and reports metadata", () => {
    const metaSpy = vi.fn();
    render(<ReviewEditor review={baseReview} onChangeMeta={metaSpy} />);

    const [pillar] = screen.getAllByRole("button", { name: "Wave" });
    fireEvent.click(pillar);

    expect(pillar).toHaveAttribute("aria-pressed", "true");
    expect(metaSpy).toHaveBeenCalledWith({ pillars: ["Wave"] });
  });

  it("adds markers and reports metadata", () => {
    const metaSpy = vi.fn();
    render(<ReviewEditor review={baseReview} onChangeMeta={metaSpy} />);

    fireEvent.change(screen.getByPlaceholderText("00:00"), {
      target: { value: "1:23" },
    });
    fireEvent.change(screen.getByPlaceholderText("Quick note"), {
      target: { value: "First blood" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add timestamp" }));

    expect(screen.getByText("1:23")).toBeInTheDocument();
    expect(screen.getByText("First blood")).toBeInTheDocument();
    expect(metaSpy).toHaveBeenCalledWith({
      markers: [expect.objectContaining({ time: "1:23", note: "First blood" })],
    });
  });
});
