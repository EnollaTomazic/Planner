"use client";

import * as React from "react";
import { TabBar, Header, Hero, Button } from "@/components/ui";
import Banner from "@/components/chrome/Banner";
import { GoalsProgress } from "@/components/goals";
import { ComponentGallery, ColorGallery } from "@/components/prompts";

export default function Page() {
  const viewTabs = [
    { key: "components", label: "Components" },
    { key: "colors", label: "Colors" },
  ];

  const [view, setView] = React.useState("components");

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
          <input
            aria-label="Timer demo"
            defaultValue="25:00"
            className="btn-like-segmented btn-glitch w-[5ch] text-center"
            type="text"
          />
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Global styles are now modularized into <code>animations.css</code>,
        <code>overlays.css</code>, and <code>utilities.css</code>.
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        Control height token <code>--control-h</code> now snaps to 44px to align
        with the 4px spacing grid.
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        Buttons now default to the 40px <code>md</code> size and follow a
        36/40/44px scale.
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        WeekPicker scrolls horizontally with snap points, showing 2–3 days at
        a time on smaller screens.
      </p>
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
          <TabBar items={viewTabs} value={view} onValueChange={setView} />
        </div>
      {view === "components" ? <ComponentGallery /> : <ColorGallery />}
    </main>
  );
}

