import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Select } from "../../src/components/ui/Select";

const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
];

afterEach(cleanup);

describe("NativeSelect", () => {
  it("derives name from aria-label when no id is provided", () => {
    const { getByRole } = render(
      <Select variant="native" aria-label="Fruit" items={items} />,
    );
    const select = getByRole("combobox") as HTMLSelectElement;
    expect(select.id).toBeTruthy();
    expect(select.name).toBe("fruit");
  });

  it("uses the provided id and slugifies the aria-label for the name", () => {
    const { getByRole } = render(
      <Select
        variant="native"
        id="fruit-select"
        aria-label="Favorite Fruit"
        items={items}
      />,
    );
    const select = getByRole("combobox") as HTMLSelectElement;
    expect(select.id).toBe("fruit-select");
    expect(select.name).toBe("favorite-fruit");
  });

  it("prefers an explicit name prop", () => {
    const { getByRole } = render(
      <Select
        variant="native"
        aria-label="Custom Fruit"
        name="fruit-choice"
        items={items}
      />,
    );
    const select = getByRole("combobox") as HTMLSelectElement;
    expect(select.name).toBe("fruit-choice");
  });
});
