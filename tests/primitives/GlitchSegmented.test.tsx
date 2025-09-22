import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import {
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
} from "../../src/components/ui/primitives/GlitchSegmented";

afterEach(cleanup);

describe("GlitchSegmented", () => {
  it("renders buttons", () => {
    const { getByRole } = render(
      <GlitchSegmentedGroup value="a" onChange={() => {}}>
        <GlitchSegmentedButton value="a">A</GlitchSegmentedButton>
        <GlitchSegmentedButton value="b">B</GlitchSegmentedButton>
      </GlitchSegmentedGroup>,
    );
    expect(getByRole("tab", { name: "A" })).toBeInTheDocument();
    expect(getByRole("tab", { name: "B" })).toBeInTheDocument();
  });

  it("has no outline when focused", () => {
    const { getByRole } = render(
      <GlitchSegmentedGroup value="a" onChange={() => {}}>
        <GlitchSegmentedButton value="a">A</GlitchSegmentedButton>
      </GlitchSegmentedGroup>,
    );
    const btn = getByRole("tab");
    btn.focus();
    const style = getComputedStyle(btn);
    expect(style.outlineStyle === "none" || style.outlineStyle === "").toBe(
      true,
    );
    expect(style.outlineWidth === "0px" || style.outlineWidth === "").toBe(
      true,
    );
  });

  it("navigates with arrow keys when formatted across multiple lines", () => {
    const onChange = vi.fn();
    const GroupWithState = () => {
      const [current, setCurrent] = React.useState("one");
      return (
        <GlitchSegmentedGroup
          value={current}
          onChange={(next) => {
            setCurrent(next);
            onChange(next);
          }}
        >
          <GlitchSegmentedButton value="one">
            One
          </GlitchSegmentedButton>
          {"\n"}
          <GlitchSegmentedButton value="two">
            Two
          </GlitchSegmentedButton>
          {"\n"}
          <GlitchSegmentedButton value="three">
            Three
          </GlitchSegmentedButton>
        </GlitchSegmentedGroup>
      );
    };

    const { getByRole } = render(<GroupWithState />);
    const first = getByRole("tab", { name: "One" });
    first.focus();

    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, "two");
    const second = getByRole("tab", { name: "Two" });
    expect(second).toHaveFocus();

    fireEvent.keyDown(second, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(2, "three");
    const third = getByRole("tab", { name: "Three" });
    expect(third).toHaveFocus();

    fireEvent.keyDown(third, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(3, "two");
    expect(second).toHaveFocus();
  });
});
