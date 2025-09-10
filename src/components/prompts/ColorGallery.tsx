"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { COLOR_PALETTES, type ColorPalette } from "@/lib/theme";

export default function ColorGallery() {
  const paletteTabs: TabItem<ColorPalette>[] = [
    { key: "core", label: "Core" },
    { key: "accent", label: "Accent" },
    { key: "status", label: "Status" },
  ];
  const [palette, setPalette] = React.useState<ColorPalette>("core");

  return (
    <div className="flex flex-col gap-8">
      <TabBar
        items={paletteTabs}
        value={palette}
        onValueChange={setPalette}
        ariaLabel="Color palettes"
      />
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {COLOR_PALETTES[palette].map((c) => (
          <div key={c} className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-accent">{c}</span>
            <div
              className="h-16 w-24 rounded-md border"
              style={{ backgroundColor: `hsl(var(--${c}))` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

