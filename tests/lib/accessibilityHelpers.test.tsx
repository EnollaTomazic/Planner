import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import useAutoFocus from "@/lib/useAutoFocus";
import useMounted from "@/lib/useMounted";
import { useFieldIds } from "@/lib/useFieldIds";
import { sanitizeList } from "@/lib/sanitizeList";
import { hasTextContent } from "@/lib/react";
import { isRecord, isStringArray, safeNumber } from "@/lib/validators";
import type { AriaAttributes } from "react";

describe("accessibility helpers", () => {
  it("shifts focus to the field when editing activates", async () => {
    const user = userEvent.setup();

    function AutoFocusProbe() {
      const ref = React.useRef<HTMLInputElement | null>(null);
      const [editing, setEditing] = React.useState(false);

      useAutoFocus({ ref, when: editing });

      return (
        <div>
          <button type="button" onClick={() => setEditing((value) => !value)}>
            Toggle editing
          </button>
          <input ref={ref} aria-label="Title" />
          <div aria-live="polite">{editing ? "editing" : "viewing"}</div>
        </div>
      );
    }

    render(<AutoFocusProbe />);

    const toggle = screen.getByRole("button", { name: "Toggle editing" });
    const input = screen.getByRole("textbox", { name: "Title" });

    expect(input).not.toHaveFocus();

    await user.click(toggle);
    await waitFor(() => expect(input).toHaveFocus());

    await user.click(toggle);
    await waitFor(() => expect(toggle).toHaveFocus());
    expect(input).not.toHaveFocus();
  });

  it("reports mounted state after the effect runs", async () => {
    const states: string[] = [];

    function MountedProbe() {
      const mounted = useMounted();
      const label = mounted ? "mounted" : "pending";
      states.push(label);
      return <span>{label}</span>;
    }

    render(<MountedProbe />);

    expect(states[0]).toBe("pending");
    await waitFor(() => expect(states.at(-1)).toBe("mounted"));
    expect(screen.getByText("mounted")).toBeInTheDocument();
  });

  it("coerces aria-invalid values returned from field ids", () => {
    type Props = { ariaInvalid?: AriaAttributes["aria-invalid"] };

    function FieldProbe({ ariaInvalid }: Props) {
      const { id, name, isInvalid } = useFieldIds(
        "Email Address",
        undefined,
        undefined,
        { ariaInvalid, slugifyFallback: true },
      );

      return (
        <div>
          <label htmlFor={id}>Email</label>
          <input id={id} name={name} aria-label="Email" data-testid="field" />
          <span data-testid="invalid-flag">{String(isInvalid)}</span>
        </div>
      );
    }

    const { rerender } = render(<FieldProbe ariaInvalid="true" />);

    const field = screen.getByTestId("field");
    expect(field).toHaveAttribute("name", "email-address");
    expect(field).toHaveAttribute("id");
    expect(screen.getByTestId("invalid-flag")).toHaveTextContent("true");

    rerender(<FieldProbe ariaInvalid={true} />);
    expect(screen.getByTestId("invalid-flag")).toHaveTextContent("true");

    rerender(<FieldProbe ariaInvalid="grammar" />);
    expect(screen.getByTestId("invalid-flag")).toHaveTextContent("true");

    rerender(<FieldProbe ariaInvalid="false" />);
    expect(screen.getByTestId("invalid-flag")).toHaveTextContent("false");

    rerender(<FieldProbe ariaInvalid={undefined} />);
    expect(screen.getByTestId("invalid-flag")).toHaveTextContent("false");
  });
});

describe("utility coverage", () => {
  it("sanitizes each entry in the list", () => {
    const result = sanitizeList(["<script>", "Tom & Jerry", '"quoted"']);
    expect(result).toEqual(["&lt;script&gt;", "Tom &amp; Jerry", "&quot;quoted&quot;"]);
  });

  it("detects text content through nested nodes and arrays", () => {
    const nested = [
      null,
      false,
      [
        "",
        <span key="outer">
          <strong>Inner text</strong>
        </span>,
      ],
    ];

    expect(hasTextContent(nested)).toBe(true);
    expect(hasTextContent([null, "   ", false])).toBe(false);
  });

  it("guards validators against edge case inputs", () => {
    expect(isRecord({ alpha: 1 })).toBe(true);
    expect(isRecord([])).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord(42)).toBe(false);

    expect(isStringArray(["a", "b"])).toBe(true);
    expect(isStringArray(["a", 3])).toBe(false);
    expect(isStringArray("not-an-array")).toBe(false);

    expect(safeNumber(10, 5)).toBe(10);
    expect(safeNumber(Number.NaN, 5)).toBe(5);
    expect(safeNumber(Number.POSITIVE_INFINITY, 7)).toBe(7);
    expect(safeNumber("3", 11)).toBe(11);
  });
});
