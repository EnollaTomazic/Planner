import React from "react";
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Textarea } from "../../src/components/ui/primitives/Textarea";
import { slugify } from "../../src/lib/utils";

afterEach(cleanup);

describe("Textarea", () => {
  it("derives the name from the aria-label by default", () => {
    const { getByRole } = render(<Textarea aria-label="Notes" />);
    const textarea = getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.id).toBeTruthy();
    expect(textarea.name).toBe("notes");
  });

  it("slugifies the generated id when no aria-label is provided", () => {
    const { getByRole } = render(<Textarea />);
    const textarea = getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.id).toBeTruthy();
    expect(textarea.name).toBe(slugify(textarea.id));
  });

  it("derives the name from aria-label when an id is provided", () => {
    const { getByRole } = render(
      <Textarea id="notes" aria-label="Detailed Notes" />,
    );
    const textarea = getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.id).toBe("notes");
    expect(textarea.name).toBe("detailed-notes");
  });

  it("prefers an explicit name prop", () => {
    const { getByRole } = render(
      <Textarea aria-label="Custom" name="custom-textarea" />,
    );
    const textarea = getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.name).toBe("custom-textarea");
  });
});
