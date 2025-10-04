"use client";

import * as React from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { useScopedCssVars } from "@/components/ui/hooks/useScopedCssVars";
import { COLOR_PALETTES, type ColorPalette } from "@/lib/theme";
import styles from "./ColorGallery.module.css";

const paletteTabs: TabItem<ColorPalette>[] = [
  { key: "aurora", label: "Aurora" },
  { key: "neutrals", label: "Neutrals" },
  { key: "accents", label: "Accents" },
];

const statusSwatches: ReadonlyArray<{
  key: "warning" | "success";
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
                {COLOR_PALETTES.aurora.map((token) => (
                  <AuroraSwatch key={token} token={token} />
                ))}
              </div>
              <p className="mt-[var(--space-2)] text-center text-label text-muted-foreground">
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
              <PaletteSwatch token={c} />
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

type StatusSwatch = (typeof statusSwatches)[number];

function getSwatchColorVar(token: string): string {
  return `var(--${token}-color, hsl(var(--${token})))`;
}

function AuroraSwatch({
  token,
}: {
  readonly token: (typeof COLOR_PALETTES.aurora)[number];
}) {
  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-aurora-swatch",
    vars: {
      "--swatch-color": getSwatchColorVar(token),
    },
  });

  return (
    <div
      className={styles.auroraSwatch}
      aria-hidden="true"
      {...(scopeProps ?? {})}
      style={style}
    />
  );
}

function PaletteSwatch({ token }: { readonly token: string }) {
  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-palette-swatch",
    vars: {
      "--swatch-color": getSwatchColorVar(token),
    },
  });

  return (
    <div
      className={styles.paletteSwatch}
      aria-hidden="true"
      {...(scopeProps ?? {})}
      style={style}
    />
  );
}

function StatusCard({ swatch }: { readonly swatch: StatusSwatch }) {
  const isSuccess = swatch.key === "success";
  const { scopeProps, style } = useScopedCssVars({
    attribute: "data-status-card",
    vars: {
      "--status-background": `hsl(var(--${swatch.key}))`,
      "--status-shadow": isSuccess
        ? "var(--elevation-2), 0 0 var(--space-4) hsl(var(--success-glow))"
        : "var(--elevation-2)",
    },
  });

  return (
    <div
      className={`${styles.statusCard} flex flex-col gap-[var(--space-2)] border border-border/35 p-[var(--space-4)]`}
      {...(scopeProps ?? {})}
      style={style}
    >
      <span className="text-label uppercase tracking-wide opacity-80">
        {swatch.label}
      </span>
      <p className="text-ui leading-snug">{swatch.description}</p>
    </div>
  );
}
