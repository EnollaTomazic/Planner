"use client";

import * as React from "react";
import clsx from "clsx";

import { TabBar, type TabItem } from "@/components/ui";
import { COLOR_PALETTES, type ColorPalette } from "@/lib/theme";
import styles from "./ColorGallery.module.css";
import { useScopedCssVars } from "@/components/ui/hooks/useScopedCssVars";

const paletteTabs: TabItem<ColorPalette>[] = [
  { key: "aurora", label: "Aurora" },
  { key: "neutrals", label: "Neutrals" },
  { key: "accents", label: "Accents" },
];

interface StatusSwatchMeta {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly fill: string;
  readonly shadow?: string;
  readonly foreground?: string;
}

const statusSwatches: readonly StatusSwatchMeta[] = [
  {
    key: "warning",
    label: "warning + text-on-accent",
    description:
      "Use text-on-accent on caution banners and toasts so the copy stays readable against the saturated fill.",
    fill: "hsl(var(--warning))",
  },
  {
    key: "success",
    label: "success + text-on-accent",
    description:
      "Pair the success fill with text-on-accent and layer success-soft or success-glow for celebratory emphasis without washing out the edges.",
    fill: "hsl(var(--success))",
    shadow: "var(--elevation-2), 0 0 var(--space-4) hsl(var(--success-glow))",
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
          className={clsx(
            styles.paletteGrid,
            "sm:grid-cols-2 md:grid-cols-3",
          )}
        >
          {p.key === "aurora" && (
            <div className="flex flex-col items-center gap-[var(--space-2)] sm:col-span-2 md:col-span-3">
              <span className="text-ui font-medium">Aurora Palette</span>
              <div className="flex gap-[var(--space-2)]">
                <PaletteSwatch token="aurora-g" className={styles.auroraSwatch} />
                <PaletteSwatch
                  token="aurora-g-light"
                  className={styles.auroraSwatch}
                />
                <PaletteSwatch token="aurora-p" className={styles.auroraSwatch} />
                <PaletteSwatch
                  token="aurora-p-light"
                  className={styles.auroraSwatch}
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
              <PaletteSwatch token={c} className={styles.paletteSwatch} />
            </div>
          ))}
          {p.key === "accents" && (
            <div className="col-span-full flex flex-col gap-[var(--space-3)]">
              <span className="text-ui font-medium text-muted-foreground">
                Status fills rely on semantic foreground tokens:
              </span>
              <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                {statusSwatches.map((swatch) => (
                  <StatusCard key={swatch.key} swatch={swatch} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function toCssVar(name: string): string {
  return name.startsWith("--") ? name : `--${name}`;
}

function getPaletteFill(token: string): string {
  return `hsl(var(${toCssVar(token)}))`;
}

function PaletteSwatch({
  token,
  className,
}: {
  token: string;
  className: string;
}) {
  const vars = React.useMemo(
    () => ({
      "--palette-fill": getPaletteFill(token),
    }),
    [token],
  );
  const { scopeProps, Style } = useScopedCssVars({
    attribute: "data-palette",
    vars,
  });

  return (
    <>
      {Style}
      <div
        className={className}
        data-id={token}
        aria-hidden="true"
        {...scopeProps}
      />
    </>
  );
}

function StatusCard({ swatch }: { swatch: StatusSwatchMeta }) {
  const vars = React.useMemo(() => {
    const next: Record<string, string> = {
      "--status-fill": swatch.fill,
    };

    if (swatch.shadow) {
      next["--status-shadow"] = swatch.shadow;
    }

    if (swatch.foreground) {
      next["--status-foreground"] = swatch.foreground;
    }

    return next;
  }, [swatch.fill, swatch.foreground, swatch.shadow]);

  const { scopeProps, Style } = useScopedCssVars({
    attribute: "data-status",
    vars,
  });

  return (
    <>
      {Style}
      <div className={styles.statusCard} data-id={swatch.key} {...scopeProps}>
        <span className={styles.statusCardTitle}>{swatch.label}</span>
        <p className={styles.statusCardCopy}>{swatch.description}</p>
      </div>
    </>
  );
}
