import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamQuickActions } from "@/components/team/TeamQuickActions";

describe("TeamQuickActions", () => {
  it("renders accessible links for provided actions", () => {
    render(
      <TeamQuickActions
        actions={[
          {
            href: "/team/dashboard",
            label: "Team dashboard",
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "Team dashboard" });
    expect(link).toHaveAttribute("href", "/team/dashboard/");
  });
});
