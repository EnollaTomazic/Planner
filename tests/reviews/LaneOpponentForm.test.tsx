import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  type LaneOpponentFormHandle, LaneOpponentForm } from "@/components/reviews/LaneOpponentForm";

afterEach(cleanup);

describe("LaneOpponentForm", () => {
  it("trims opponent values before committing on blur", () => {
    const commitMeta = vi.fn();
    render(<LaneOpponentForm commitMeta={commitMeta} />);

    const opponentInput = screen.getByPlaceholderText(
      "Draven/Thresh",
    ) as HTMLInputElement;

    fireEvent.change(opponentInput, { target: { value: "  Jinx  " } });
    fireEvent.blur(opponentInput);

    expect(commitMeta).toHaveBeenCalledWith({ opponent: "Jinx" });
  });

  it("trims opponent values when saving", () => {
    const commitMeta = vi.fn();
    const ref = React.createRef<LaneOpponentFormHandle>();

    render(<LaneOpponentForm ref={ref} commitMeta={commitMeta} />);

    const opponentInput = screen.getByPlaceholderText(
      "Draven/Thresh",
    ) as HTMLInputElement;

    fireEvent.change(opponentInput, { target: { value: "  Morgana  " } });
    expect(ref.current).not.toBeNull();
    ref.current?.save();

    const lastCall = commitMeta.mock.calls.at(-1);

    expect(lastCall?.[0]).toEqual({ opponent: "Morgana" });
    expect(commitMeta).not.toHaveBeenCalledWith({ opponent: "  Morgana  " });
  });

  it("syncs lane and opponent inputs when props change", async () => {
    const commitMeta = vi.fn();
    const { rerender } = render(
      <LaneOpponentForm
        lane="Bot Lane"
        opponent="Jinx"
        commitMeta={commitMeta}
      />,
    );

    const laneInput = screen.getByPlaceholderText("Ashe/Lulu") as HTMLInputElement;
    const opponentInput = screen.getByPlaceholderText(
      "Draven/Thresh",
    ) as HTMLInputElement;

    expect(laneInput.value).toBe("Bot Lane");
    expect(opponentInput.value).toBe("Jinx");

    fireEvent.change(laneInput, { target: { value: "Changed Lane" } });
    fireEvent.change(opponentInput, { target: { value: "Changed Opp" } });

    expect(laneInput.value).toBe("Changed Lane");
    expect(opponentInput.value).toBe("Changed Opp");

    rerender(
      <LaneOpponentForm
        lane="Mid Lane"
        opponent="Ahri"
        commitMeta={commitMeta}
      />,
    );

    await waitFor(() => {
      expect(laneInput.value).toBe("Mid Lane");
      expect(opponentInput.value).toBe("Ahri");
    });
  });

  it("associates the opponent section label with the input", () => {
    const commitMeta = vi.fn();
    render(<LaneOpponentForm commitMeta={commitMeta} />);

    const opponentInput = screen.getByRole("textbox", {
      name: "Opponent",
    }) as HTMLInputElement;
    const label = screen.getByText("Opponent");
    const labelledBy = opponentInput.getAttribute("aria-labelledby");

    expect(label).toHaveAttribute("id");
    expect(labelledBy).toBe(label.getAttribute("id"));
    expect(screen.getByLabelText("Opponent")).toBe(opponentInput);
  });

  it("focuses the opponent input when pressing Enter on the lane field", () => {
    const commitMeta = vi.fn();
    render(<LaneOpponentForm commitMeta={commitMeta} />);

    const laneInput = screen.getByPlaceholderText("Ashe/Lulu") as HTMLInputElement;
    const opponentInput = screen.getByPlaceholderText(
      "Draven/Thresh",
    ) as HTMLInputElement;

    laneInput.focus();
    expect(laneInput).toHaveFocus();

    fireEvent.keyDown(laneInput, { key: "Enter", code: "Enter" });

    expect(opponentInput).toHaveFocus();
  });
});
