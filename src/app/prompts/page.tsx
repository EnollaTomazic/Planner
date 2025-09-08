"use client";

import * as React from "react";
import { TabBar, Header, Hero, Button } from "@/components/ui";
import Banner from "@/components/chrome/Banner";
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
      <div className="mb-8">
        <TabBar items={viewTabs} value={view} onValueChange={setView} />
      </div>
      {view === "components" ? <ComponentGallery /> : <ColorGallery />}
    </main>
  );
}

