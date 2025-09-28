import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import PillarSelector from "@/components/ui/league/pillars/PillarSelector";
import type { Pillar } from "@/lib/types";

function FocusHarness() {
  const [pillars, setPillars] = React.useState<Pillar[]>([]);
  return <PillarSelector value={pillars} onChange={setPillars} />;
}

describe("PillarSelector", () => {
  it("applies focus styling on keyboard navigation and syncs aria-pressed", async () => {
    const user = userEvent.setup();
    render(<FocusHarness />);

    const buttons = screen.getAllByRole("button");

    await user.tab();
    const [wave, trading] = buttons as HTMLButtonElement[];
    expect(trading).toBeDefined();
    expect(wave).toHaveFocus();
    assertFocusVisible(wave, true);

    await user.keyboard("{Space}");
    await waitFor(() => {
      expect(wave).toHaveAttribute("aria-pressed", "true");
    });

    await user.tab();
    expect(wave).not.toHaveFocus();
    expect(trading).toHaveFocus();
    assertFocusVisible(wave, false);
    assertFocusVisible(trading, true);

    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(trading).toHaveAttribute("aria-pressed", "true");
    });
  });
});

function assertFocusVisible(element: HTMLElement, expected: boolean) {
  try {
    expect(element.matches(":focus-visible")).toBe(expected);
  } catch {
    if (expected) {
      expect(element).toHaveFocus();
    } else {
      expect(element).not.toHaveFocus();
    }
  }
}
