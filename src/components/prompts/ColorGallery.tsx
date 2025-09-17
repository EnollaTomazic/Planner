"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { COLOR_PALETTES, type ColorPalette } from "@/lib/theme";

const paletteTabs: TabItem<ColorPalette>[] = [
  { key: "aurora", label: "Aurora" },
  { key: "neutrals", label: "Neutrals" },
  { key: "accents", label: "Accents" },
];

export default function ColorGallery() {
  const [palette, setPalette] = React.useState<ColorPalette>("aurora");
  const panelRefs = React.useRef<Record<ColorPalette, HTMLDivElement | null>>({
    aurora: null,
    neutrals: null,
    accents: null,
  });

  React.useEffect(() => {
    panelRefs.current[palette]?.focus();
  }, [palette]);

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
          tabIndex={palette === p.key ? 0 : -1}
          ref={(el) => {
            panelRefs.current[p.key] = el;
          }}
          className="grid gap-8 sm:grid-cols-2 md:grid-cols-3"
        >
          {p.key === "aurora" && (
            <div className="flex flex-col items-center gap-2 sm:col-span-2 md:col-span-3">
              <span className="text-ui font-medium">Aurora Palette</span>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-md bg-aurora-g" />
                <div className="w-10 h-10 rounded-md bg-aurora-g-light" />
                <div className="w-10 h-10 rounded-md bg-aurora-p" />
                <div className="w-10 h-10 rounded-md bg-aurora-p-light" />
              </div>
              <p className="mt-2 text-center text-label text-muted-foreground">
                Use <code>aurora-g</code>, <code>aurora-g-light</code>,{" "}
                <code>aurora-p</code>, and <code>aurora-p-light</code> Tailwind
                classes for aurora effects.
              </p>
            </div>
          )}
          {COLOR_PALETTES[p.key].map((c) => (
            <div key={c} className="flex flex-col items-center gap-2">
              <span className="text-label uppercase tracking-wide text-accent-3">
                {c}
              </span>
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
