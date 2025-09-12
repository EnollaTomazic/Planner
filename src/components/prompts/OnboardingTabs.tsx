"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { usePrompts } from "./usePrompts";

type Role = "designer" | "developer";

const ROLE_TABS: TabItem<Role>[] = [
  { key: "designer", label: "Senior Lead Designer" },
  { key: "developer", label: "Senior Lead Developer" },
];

export default function OnboardingTabs() {
  const [role, setRole] = React.useState<Role>("designer");
  const { prompts } = usePrompts();
  const [updatedAt, setUpdatedAt] = React.useState(Date.now());

  React.useEffect(() => {
    setUpdatedAt(Date.now());
  }, [prompts]);

  return (
    <div className="space-y-4">
      <TabBar
        items={ROLE_TABS}
        value={role}
        onValueChange={setRole}
        ariaLabel="Onboarding roles"
      />
      <p className="text-sm text-muted-foreground">
        Last updated {new Date(updatedAt).toLocaleTimeString()}
      </p>
      <div
        role="tabpanel"
        id="designer-panel"
        aria-labelledby="designer-tab"
        hidden={role !== "designer"}
        tabIndex={0}
      >
        <ul className="list-disc pl-6 space-y-1">
          <li>Review design system guidelines</li>
          <li>Audit existing components for consistency</li>
          <li>Collaborate with developers on UI implementation</li>
        </ul>
      </div>
      <div
        role="tabpanel"
        id="developer-panel"
        aria-labelledby="developer-tab"
        hidden={role !== "developer"}
        tabIndex={0}
      >
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Global styles are now modularized into <code>animations.css</code>,
            <code>overlays.css</code>, and <code>utilities.css</code>.
          </li>
          <li>
            Control height token <code>--control-h</code> now snaps to 44px to
            align with the 4px spacing grid.
          </li>
          <li>
            Buttons now default to the 40px <code>md</code> size and follow a
            36/40/44px scale.
          </li>
          <li>
            WeekPicker scrolls horizontally with snap points, showing 2–3 days
            at a time on smaller screens.
          </li>
          <li>Review status dots blink to highlight wins and losses.</li>
          <li>
            Hero dividers now use <code>var(--space-4)</code> top padding and
            tokenized side offsets via <code>var(--space-2)</code>.
          </li>
          <li>
            IconButton adds a compact <code>xs</code> size.
          </li>
          <li>
            DurationSelector active state uses accent color tokens.
          </li>
          <li>
            Color gallery groups tokens into Aurora, Neutrals, and Accents
            palettes with tabs.
          </li>
          <li>Prompts page refactored into playground.</li>
        </ul>
      </div>
    </div>
  );
}

