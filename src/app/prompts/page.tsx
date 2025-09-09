"use client";

import * as React from "react";
import { TabBar, Header, Hero, Button, type TabItem } from "@/components/ui";
import Banner from "@/components/chrome/Banner";
import { GoalsProgress } from "@/components/goals";
import { RoleSelector, NeonIcon } from "@/components/reviews";
import { ComponentGallery, ColorGallery } from "@/components/prompts";
import { ROLE_OPTIONS } from "@/components/reviews/reviewData";
import type { Role } from "@/lib/types";

type View = "components" | "colors";

export default function Page() {
  const viewTabs: TabItem<View>[] = [
    { key: "components", label: "Components" },
    { key: "colors", label: "Colors" },
  ];

  const [view, setView] = React.useState<View>("components");
  const [role, setRole] = React.useState<Role>(ROLE_OPTIONS[0].value);

  return (
    <main className="page-shell py-6">
      <div className="mb-8 space-y-4">
        <Header heading="Header" sticky={false} />
        <Hero heading="Hero" sticky={false} />
        <Banner title="Banner" actions={<Button size="sm">Action</Button>} />
        <div className="flex justify-center">
          <GoalsProgress total={5} pct={60} />
        </div>
        <div className="flex justify-center">
          <RoleSelector value={role} onChange={setRole} />
        </div>
        <div className="flex justify-center gap-4">
          <NeonIcon kind="clock" on={true} />
          <NeonIcon kind="brain" on={true} />
          <NeonIcon kind="file" on={false} />
        </div>
        <div className="flex justify-center">
          <input
            aria-label="Timer demo"
            defaultValue="25:00"
            className="btn-like-segmented btn-glitch w-[5ch] text-center"
            type="text"
          />
        </div>
      </div>
      <ul className="mb-4 space-y-4">
        <li className="text-sm text-muted-foreground">
          Global styles are now modularized into <code>animations.css</code>,
          <code>overlays.css</code>, and <code>utilities.css</code>.
        </li>
        <li className="text-sm text-muted-foreground">
          Control height token <code>--control-h</code> now snaps to 44px to
          align with the 4px spacing grid.
        </li>
        <li className="text-sm text-muted-foreground">
          Buttons now default to the 40px <code>md</code> size and follow a
          36/40/44px scale.
        </li>
        <li className="text-sm text-muted-foreground">
          WeekPicker scrolls horizontally with snap points, showing 2–3 days at
          a time on smaller screens.
        </li>
        <li className="text-sm text-muted-foreground">
          Review status dots blink to highlight wins and losses.
        </li>
        <li className="text-sm text-muted-foreground">
          Hero dividers now use <code>var(--space-4)</code> top padding and
          tokenized side offsets via <code>var(--space-2)</code>.
        </li>
      </ul>
      <div className="mb-8 flex flex-wrap gap-2">
        <Button tone="primary">Primary tone</Button>
        <Button tone="accent">Accent tone</Button>
        <Button tone="info" variant="ghost">
          Info ghost
        </Button>
        <Button tone="danger" variant="primary">
          Danger primary
        </Button>
      </div>
      <p className="mb-4 text-xs text-danger">Example error message</p>
      <div className="mb-8">
        <TabBar
          items={viewTabs}
          value={view}
          onValueChange={(k) => setView(k)}
          ariaLabel="Prompts gallery view"
        />
      </div>
      {view === "components" ? <ComponentGallery /> : <ColorGallery />}
    </main>
  );
}
