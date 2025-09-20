import { describe, it, expect } from "vitest";
import { normalizeTeamComps, type TeamComp } from "@/components/team/MyComps";

const baseComp: TeamComp = {
  id: "comp-1",
  title: "Sample",
  roles: { Top: [], Jungle: [], Mid: [], Bot: [], Support: [] },
  notes: "",
  createdAt: 0,
  updatedAt: 0,
};

describe("normalizeTeamComps", () => {
  it("trims champion names and removes empty entries", () => {
    const input: unknown[] = [
      {
        ...baseComp,
        roles: {
          Top: ["  Aatrox  ", ""],
          Jungle: ["  Sejuani  ", "   "],
        },
      },
    ];

    const [comp] = normalizeTeamComps(input);
    expect(comp.roles.Top).toEqual(["Aatrox"]);
    expect(comp.roles.Jungle).toEqual(["Sejuani"]);
    expect(comp.roles.Mid).toEqual([]);
  });
});
