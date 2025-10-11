import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChampListEditor } from "@/components/team/ChampListEditor";

describe("ChampListEditor", () => {
  it("trims champion names before committing changes", () => {
    const handleChange = vi.fn();

    render(
      <ChampListEditor list={[""]} onChange={handleChange} editing />,
    );

    const input = screen.getByLabelText("Champion name");
    fireEvent.change(input, { target: { value: "  Ashe  " } });

    expect(handleChange).toHaveBeenLastCalledWith(["Ashe"]);
  });

  it("normalizes initial list values for editing", () => {
    const handleChange = vi.fn();

    render(
      <ChampListEditor
        list={["  Sejuani  "]}
        onChange={handleChange}
        editing
      />,
    );

    const input = screen.getByLabelText("Champion name");
    expect(input).toHaveValue("Sejuani");
  });
});
