"use client";

import * as React from "react";
import { SectionCard as UiSectionCard } from "@/components/ui";
import { COLOR_SECTIONS } from "./constants";

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, hsl(var(--surface)) 25%, hsl(var(--surface-2)) 25%, hsl(var(--surface-2)) 50%, hsl(var(--surface)) 50%, hsl(var(--surface)) 75%, hsl(var(--surface-2)) 75%, hsl(var(--surface-2)) 100%), linear-gradient(45deg, hsl(var(--surface-2)) 25%, hsl(var(--surface)) 25%, hsl(var(--surface)) 50%, hsl(var(--surface-2)) 50%, hsl(var(--surface-2)) 75%, hsl(var(--surface)) 75%, hsl(var(--surface)) 100%)",
  backgroundPosition: "0 0, var(--space-2) var(--space-2)",
  backgroundSize: "calc(var(--space-2) * 2) calc(var(--space-2) * 2)",
};

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-title font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

type SwatchProps = { token: string };

function Swatch({ token }: SwatchProps) {
  const swatchRef = React.useRef<HTMLDivElement | null>(null);
  const [resolvedColor, setResolvedColor] = React.useState<string | null>(null);
  const [isTranslucent, setIsTranslucent] = React.useState(false);

  React.useEffect(() => {
    const node = swatchRef.current;
    if (!node) {
      return;
    }

    const computed = window.getComputedStyle(node);
    const rawValue = computed.getPropertyValue(`--${token}`).trim();

    if (!rawValue) {
      setResolvedColor(null);
      setIsTranslucent(false);
      return;
    }

    let color = rawValue;
    const supportsColor = window.CSS?.supports;
    let translucent = false;

    const slashMatch = rawValue.match(/\/(\s*[0-9.]+)(%?)/);

    if (slashMatch) {
      const numeric = parseFloat(slashMatch[1]);
      if (!Number.isNaN(numeric)) {
        const alpha = slashMatch[2] === "%" ? numeric / 100 : numeric;
        translucent = alpha < 1;
      }
    } else if (rawValue.includes("transparent")) {
      translucent = true;
    }

    if (typeof supportsColor === "function") {
      if (!supportsColor("color", rawValue)) {
        const hslValue = `hsl(${rawValue})`;
        color = supportsColor("color", hslValue) ? hslValue : rawValue;
      }
    } else if (!rawValue.includes("(")) {
      color = `hsl(${rawValue})`;
    }

    setResolvedColor(color);
    setIsTranslucent(translucent);
  }, [token]);

  return (
    <li className="flex flex-col items-center gap-[var(--space-2)] xl:col-span-3">
      <div className="relative h-16 w-full overflow-hidden rounded-card r-card-md border border-[var(--card-hairline)]">
        {isTranslucent ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={CHECKERBOARD_STYLE}
          />
        ) : null}
        <div
          ref={swatchRef}
          className="relative h-full w-full"
          style={{ backgroundColor: resolvedColor ?? undefined }}
        />
      </div>
      <span className="block w-full break-words text-center text-label font-medium">
        --{token}
      </span>
    </li>
  );
}

function GradientSwatch() {
  return (
    <li className="col-span-full flex flex-col items-center gap-[var(--space-2)]">
      <div className="h-16 w-full rounded-card r-card-md bg-gradient-to-r from-primary via-accent to-[hsl(var(--accent-2))]" />
      <span className="block w-full text-center text-label font-medium">
        from-primary via-accent to-[hsl(var(--accent-2))]
      </span>
    </li>
  );
}

export default function ColorsView() {
  return (
    <div className="space-y-8">
      {COLOR_SECTIONS.map((p) => (
        <SectionCard key={p.title} title={p.title}>
          <ul className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 md:grid-cols-4 md:gap-[var(--space-4)] xl:grid-cols-12 xl:gap-[var(--space-5)]">
            {p.tokens.map((t) => (
              <Swatch key={t} token={t} />
            ))}
          </ul>
        </SectionCard>
      ))}
      <SectionCard title="Gradients">
        <ul className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 md:grid-cols-4 md:gap-[var(--space-4)] xl:grid-cols-12 xl:gap-[var(--space-5)]">
          <GradientSwatch />
        </ul>
      </SectionCard>
      <SectionCard title="SectionCard Variants">
        <div className="flex flex-col gap-4">
          <UiSectionCard>
            <UiSectionCard.Header title="Neo (default)" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
          <UiSectionCard variant="plain">
            <UiSectionCard.Header title="Plain" />
            <UiSectionCard.Body>Content</UiSectionCard.Body>
          </UiSectionCard>
        </div>
      </SectionCard>
    </div>
  );
}
