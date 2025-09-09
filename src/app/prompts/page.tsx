"use client";

import * as React from "react";
import { TabBar, Header, type TabItem } from "@/components/ui";
import { ComponentGallery, ColorGallery } from "@/components/prompts";

type View = "components" | "colors";

const VIEW_TABS: TabItem<View>[] = [
  { key: "components", label: "Components" },
  { key: "colors", label: "Colors" },
];

export default function Page() {
  const [view, setView] = React.useState<View>("components");

  return (
    <main className="page-shell py-6">
      <Header heading="Prompts" sticky={false} />
      <div className="mb-8">
        <TabBar
          items={VIEW_TABS}
          value={view}
          onValueChange={setView}
          ariaLabel="Prompts gallery view"
        />
      </div>
      {view === "components" ? <ComponentGallery /> : <ColorGallery />}
    </main>
  );
}

