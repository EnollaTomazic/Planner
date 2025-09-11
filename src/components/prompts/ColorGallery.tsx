"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { COLOR_PALETTES, type ColorPalette } from "@/lib/theme";

export default function ColorGallery() {
  const paletteTabs: TabItem<ColorPalette>[] = [
    { key: "aurora", label: "Aurora" },
    { key: "neutrals", label: "Neutrals" },
    { key: "accents", label: "Accents" },
  ];
  const [palette, setPalette] = React.useState<ColorPalette>("aurora");

  return (
    <div className="flex flex-col gap-8">
      <TabBar
        items={paletteTabs}
        value={palette}
        onValueChange={setPalette}
        ariaLabel="Color palettes"
      />
      {paletteTabs.map((p) => (
        <div
          key={p.key}
          role="tabpanel"
          id={`${p.key}-panel`}
          aria-labelledby={`${p.key}-tab`}
          hidden={palette !== p.key}
          tabIndex={0}
          className="grid gap-8 sm:grid-cols-2 md:grid-cols-3"
        >
          {p.key === "aurora" && (
            <div className="flex flex-col items-center gap-2 sm:col-span-2 md:col-span-3">
              <span className="text-sm font-medium">Aurora Palette</span>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded bg-auroraG" />
                <div className="w-10 h-10 rounded bg-auroraGLight" />
                <div className="w-10 h-10 rounded bg-auroraP" />
                <div className="w-10 h-10 rounded bg-auroraPLight" />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Use <code>auroraG</code>, <code>auroraGLight</code>, <code>auroraP</code>,
                and <code>auroraPLight</code> Tailwind classes for aurora effects.
              </p>
            </div>
          )}
          {COLOR_PALETTES[p.key].map((c) => (
            <div key={c} className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-accent">{c}</span>
              <div
                className="h-16 w-24 rounded-md border"
                style={{ backgroundColor: `hsl(var(--${c}))` }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

