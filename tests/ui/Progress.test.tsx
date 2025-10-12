import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Progress } from "@/components/ui/feedback/Progress";

describe("Progress", () => {
  it("exposes its label on the progressbar element", () => {
    render(<Progress value={42} label="Uploading" />);
    const progressbar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(progressbar).toHaveAccessibleName("Uploading");
    expect(progressbar).toHaveAttribute("aria-valuenow", "42");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });
});
