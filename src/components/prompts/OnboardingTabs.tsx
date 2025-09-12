"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { usePrompts } from "./usePrompts";

type Role = "designer" | "developer";

const ROLE_TABS: TabItem<Role>[] = [
  {
    key: "designer",
    label: "Senior Lead Designer",
    id: "designer-tab",
    controls: "designer-panel",
  },
  {
    key: "developer",
    label: "Senior Lead Developer",
    id: "developer-tab",
    controls: "developer-panel",
  },
];

export default function OnboardingTabs() {
  const [role, setRole] = React.useState<Role>("designer");
  const { prompts } = usePrompts();
  const [updatedAt, setUpdatedAt] = React.useState(Date.now());
  const designerRef = React.useRef<HTMLDivElement>(null);
  const developerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setUpdatedAt(Date.now());
  }, [prompts]);

  React.useEffect(() => {
    if (role === "designer") designerRef.current?.focus();
    else developerRef.current?.focus();
  }, [role]);

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
        tabIndex={role === "designer" ? 0 : -1}
        ref={designerRef}
      >
        <ul className="pl-6 space-y-1 list-none text-foreground">
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>Review design system guidelines</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>Audit existing components for consistency</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>Collaborate with developers on UI implementation</span>
          </li>
        </ul>
      </div>
      <div
        role="tabpanel"
        id="developer-panel"
        aria-labelledby="developer-tab"
        hidden={role !== "developer"}
        tabIndex={role === "developer" ? 0 : -1}
        ref={developerRef}
      >
        <ul className="pl-6 space-y-1 list-none text-foreground">
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>
              Global styles are now modularized into <code>animations.css</code>,
              <code>overlays.css</code>, and <code>utilities.css</code>.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>
              Control height token <code>--control-h</code> now snaps to 44px to
              align with the 4px spacing grid.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>
              Buttons now default to the 40px <code>md</code> size and follow a
              36/40/44px scale.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>
              WeekPicker scrolls horizontally with snap points, showing 2–3 days
              at a time on smaller screens.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>Review status dots blink to highlight wins and losses.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>
              Hero dividers now use <code>var(--space-4)</code> top padding and
              tokenized side offsets via <code>var(--space-2)</code>.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>
              IconButton adds a compact <code>xs</code> size.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>DurationSelector active state uses accent color tokens.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>
              Color gallery groups tokens into Aurora, Neutrals, and Accents
              palettes with tabs.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-current" />
            <span>Prompts page refactored into playground.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

