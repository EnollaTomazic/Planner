"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { COLOR_PALETTES, type ColorPalette } from "@/lib/theme";

const paletteTabs: TabItem<ColorPalette>[] = [
  { key: "aurora", label: "Aurora" },
  { key: "neutrals", label: "Neutrals" },
  { key: "accents", label: "Accents" },
];

const auroraSwatchStyle: React.CSSProperties = {
  blockSize: "calc(var(--space-7) - var(--space-2))",
  inlineSize: "calc(var(--space-7) - var(--space-2))",
};

const paletteSwatchStyle: React.CSSProperties = {
  blockSize: "var(--space-8)",
  inlineSize: "calc(var(--space-8) + var(--space-6))",
};

const directColorTokens = new Set([
  "aurora-g-light",
  "aurora-p-light",
]);

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
    <div className="flex flex-col gap-[var(--space-8)]">
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
          className="grid gap-[var(--space-8)] sm:grid-cols-2 md:grid-cols-3"
        >
          {p.key === "aurora" && (
            <div className="flex flex-col items-center gap-[var(--space-2)] sm:col-span-2 md:col-span-3">
              <span className="text-ui font-medium">Aurora Palette</span>
              <div className="flex gap-[var(--space-2)]">
                <div
                  className="rounded-[var(--radius-md)] bg-aurora-g"
                  style={auroraSwatchStyle}
                />
                <div
                  className="rounded-[var(--radius-md)] bg-aurora-g-light"
                  style={auroraSwatchStyle}
                />
                <div
                  className="rounded-[var(--radius-md)] bg-aurora-p"
                  style={auroraSwatchStyle}
                />
                <div
                  className="rounded-[var(--radius-md)] bg-aurora-p-light"
                  style={auroraSwatchStyle}
                />
              </div>
              <p className="mt-2 text-center text-label text-muted-foreground">
                Use <code>aurora-g</code>, <code>aurora-g-light</code>,{" "}
                <code>aurora-p</code>, and <code>aurora-p-light</code> Tailwind
                classes for aurora effects.
              </p>
            </div>
          )}
          {COLOR_PALETTES[p.key].map((c) => {
            const backgroundColor = directColorTokens.has(c)
              ? `var(--${c})`
              : `hsl(var(--${c}))`;

            return (
              <div key={c} className="flex flex-col items-center gap-[var(--space-2)]">
                <span className="text-label uppercase tracking-wide text-accent-3">
                  {c}
                </span>
                <div
                  className="rounded-[var(--radius-lg)] border"
                  style={{
                    ...paletteSwatchStyle,
                    backgroundColor,
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
