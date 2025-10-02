import { describe, expect, it } from "vitest";

import {
  BUTTON_CONTROL_STATE_IDS,
  BUTTON_PREVIEW_REQUIRED_STATE_IDS,
} from "@/app/preview/buttons/ButtonsPreviewMatrixClient";
import {
  CARD_CONTROL_STATE_IDS,
  CARD_PREVIEW_REQUIRED_STATE_IDS,
} from "@/app/preview/cards/CardsPreviewMatrixClient";
import {
  FORM_CONTROL_STATE_IDS,
  FORM_PREVIEW_REQUIRED_STATE_IDS,
} from "@/app/preview/forms/FormsPreviewMatrixClient";

const expectStatesCover = (
  label: string,
  states: readonly string[],
  required: readonly string[],
) => {
  const stateSet = new Set(states);
  const missing = required.filter((state) => !stateSet.has(state));
  expect(missing, `${label} missing states: ${missing.join(", ")}`).toEqual([]);
};

describe("preview state coverage", () => {
  it("covers required button states", () => {
    const required = BUTTON_PREVIEW_REQUIRED_STATE_IDS;
    for (const [control, states] of Object.entries(BUTTON_CONTROL_STATE_IDS)) {
      expectStatesCover(`button:${control}`, states, required);
    }
  });

  it("covers required card states", () => {
    const required = CARD_PREVIEW_REQUIRED_STATE_IDS;
    for (const [control, states] of Object.entries(CARD_CONTROL_STATE_IDS)) {
      expectStatesCover(`card:${control}`, states, required);
    }
  });

  it("covers required form states", () => {
    const required = FORM_PREVIEW_REQUIRED_STATE_IDS;
    for (const [control, states] of Object.entries(FORM_CONTROL_STATE_IDS)) {
      expectStatesCover(`form:${control}`, states, required);
    }
  });
});
