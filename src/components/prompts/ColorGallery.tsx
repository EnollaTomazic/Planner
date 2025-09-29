"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { COLOR_PALETTES, type ColorPalette } from "@/lib/theme";
import styles from "./ColorGallery.module.css";
import { useScopedCss } from "@/lib/useScopedCss";

const paletteTabs: TabItem<ColorPalette>[] = [
  { key: "aurora", label: "Aurora" },
  { key: "neutrals", label: "Neutrals" },
  { key: "accents", label: "Accents" },
];

const statusSwatches: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
}> = [
  {
    key: "warning",
    label: "warning + text-on-accent",
    description:
      "Use text-on-accent on caution banners and toasts so the copy stays readable against the saturated fill.",
  },
  {
    key: "success",
    label: "success + text-on-accent",
    description:
      "Pair the success fill with text-on-accent and layer success-soft or success-glow for celebratory emphasis without washing out the edges.",
  },
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

  const scopedCss = useScopedCss({
    attribute: "data-color-gallery-scope",
    generator: React.useCallback((scopeSelector: string) => {
      const declarations: string[] = [];

      const registerPaletteToken = (token: string) => {
        declarations.push(
          `${scopeSelector} [data-preview-type="palette"][data-preview-id="${token}"] { --palette-color: ${getPaletteColorValue(token)}; }`,
        );
      };

      for (const paletteTokens of Object.values(COLOR_PALETTES)) {
        for (const token of paletteTokens) {
          registerPaletteToken(token);
        }
      }

      for (const { key } of statusSwatches) {
        const selector = `${scopeSelector} [data-preview-type="status"][data-preview-id="${key}"]`;

        if (key === "success") {
          declarations.push(
            `${selector} { --status-fill: hsl(var(--success)); --status-shadow: var(--elevation-2), 0 0 var(--space-4) hsl(var(--success-glow)); }`,
          );
        } else if (key === "warning") {
          declarations.push(
            `${selector} { --status-fill: hsl(var(--warning)); --status-shadow: var(--elevation-2); }`,
          );
        }
      }

      return declarations.join("\n");
    }, []),
  });

  return (
    <div
      className="flex flex-col gap-[var(--space-8)]"
      data-color-gallery-scope={scopedCss.scopeValue}
    >
      {scopedCss.styles}
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
                  className={styles.auroraSwatch}
                  data-preview-id="aurora-g"
                  data-preview-type="palette"
                />
                <div
                  className={styles.auroraSwatch}
                  data-preview-id="aurora-g-light"
                  data-preview-type="palette"
                />
                <div
                  className={styles.auroraSwatch}
                  data-preview-id="aurora-p"
                  data-preview-type="palette"
                />
                <div
                  className={styles.auroraSwatch}
                  data-preview-id="aurora-p-light"
                  data-preview-type="palette"
                />
              </div>
              <p className="mt-2 text-center text-label text-muted-foreground">
                Use <code>aurora-g</code>, <code>aurora-g-light</code>,{" "}
                <code>aurora-p</code>, and <code>aurora-p-light</code> Tailwind
                classes for aurora effects.
              </p>
            </div>
          )}
          {COLOR_PALETTES[p.key].map((c) => (
            <div key={c} className="flex flex-col items-center gap-[var(--space-2)]">
              <span className="text-label uppercase tracking-wide text-accent-3">
                {c}
              </span>
              <div
                className={styles.paletteSwatch}
                data-preview-id={c}
                data-preview-type="palette"
              />
            </div>
          ))}
          {p.key === "accents" && (
            <div className="col-span-full flex flex-col gap-[var(--space-3)]">
              <span className="text-ui font-medium text-muted-foreground">
                Status fills rely on semantic foreground tokens:
              </span>
              <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                {statusSwatches.map((swatch) => (
                  <div
                    key={swatch.key}
                    data-preview-id={swatch.key}
                    data-preview-type="status"
                    className={`${styles.statusCard} flex flex-col gap-[var(--space-2)] p-[var(--space-4)]`}
                  >
                    <span className="text-label uppercase tracking-wide opacity-80">
                      {swatch.label}
                    </span>
                    <p className="text-ui leading-snug">{swatch.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getPaletteColorValue(token: string): string {
  return `var(--${token}-color, hsl(var(--${token})))`;
}
