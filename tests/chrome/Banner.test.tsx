import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Banner from "@/components/chrome/Banner";

describe("Banner", () => {
  it("renders header structure without sticky or actions", () => {
    render(
      <Banner title="Banner Title">
        <p>Body content</p>
      </Banner>,
    );

    const header = screen.getByRole("banner");

    expect(header).toBeInTheDocument();
    expect(header).not.toHaveClass("sticky");
    expect(screen.getByText("Banner Title")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("applies sticky styling and renders actions when provided", () => {
    render(
      <Banner
        sticky
        title="Sticky Title"
        actions={<button type="button">Action</button>}
      >
        <span>Content</span>
      </Banner>,
    );

    const header = screen.getByRole("banner");

    expect(header).toHaveClass("sticky", "top-0", "z-30", "sticky-blur", "border-b");
    expect(header).toHaveStyle({ borderColor: "hsl(var(--border))" });
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
