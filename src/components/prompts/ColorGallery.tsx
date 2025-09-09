"use client";

import * as React from "react";
import {
  COLOR_PALETTES,
  COLOR_PALETTE_TABS,
  type ColorPalette,
} from "@/lib/theme";
import { TabBar, type TabItem } from "@/components/ui";

export default function ColorGallery() {
  const paletteTabs: TabItem<ColorPalette>[] = COLOR_PALETTE_TABS.map(
    ({ id, label }) => ({ key: id, label }),
  );
  const [palette, setPalette] = React.useState<ColorPalette>("aurora");
  const tokens = COLOR_PALETTES[palette];

  return (
    <div className="space-y-4">
      <TabBar
        items={paletteTabs}
        value={palette}
        onValueChange={(p) => setPalette(p)}
        ariaLabel="Color palettes"
      />
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {palette === "aurora" && (
          <div className="flex flex-col items-center gap-2 sm:col-span-2 md:col-span-3">
            <span className="text-sm font-medium">Aurora Palette</span>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded bg-auroraG" />
              <div className="w-10 h-10 rounded bg-auroraGLight" />
              <div className="w-10 h-10 rounded bg-auroraP" />
              <div className="w-10 h-10 rounded bg-auroraPLight" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Use <code>auroraG</code>, <code>auroraGLight</code>, <code>auroraP</code>,
              and<code>auroraPLight</code> Tailwind classes for aurora effects.
            </p>
          </div>
        )}
        {tokens.map((c) => (
          <div key={c} className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-accent">{c}</span>
            <div
              className="w-24 h-16 rounded-md border"
              style={{ backgroundColor: `hsl(var(--${c}))` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

