"use client";

import * as React from "react";
import { SectionLabel } from "@/components/reviews/SectionLabel";
import { PillarBadge } from "@/components/ui/league/pillars/PillarBadge";
import { ALL_PILLARS } from "@/components/reviews/reviewData";
import { cn } from "@/lib/utils";
import type { Pillar, Review } from "@/lib/types";
import styles from "./NeonPillarChip.module.css";

export type PillarsSelectorHandle = {
  save: () => void;
};

type PillarsSelectorProps = {
  pillars?: Pillar[];
  commitMeta: (patch: Partial<Review>) => void;
};

function NeonPillarChip({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const prev = React.useRef(active);
  const [phase, setPhase] = React.useState<
    "steady-on" | "ignite" | "off" | "powerdown"
  >(active ? "steady-on" : "off");

  React.useEffect(() => {
    if (active !== prev.current) {
      if (active) {
        setPhase("ignite");
        const t = setTimeout(() => setPhase("steady-on"), 620);
        prev.current = active;
        return () => clearTimeout(t);
      } else {
        setPhase("powerdown");
        const t = setTimeout(() => setPhase("off"), 360);
        prev.current = active;
        return () => clearTimeout(t);
      }
    }
    prev.current = active;
  }, [active]);

  const lit = phase === "ignite" || phase === "steady-on";

  return (
    <span
      className={cn("relative inline-flex", styles.root)}
      data-lit={lit ? "true" : undefined}
      data-phase={phase}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-card r-card-lg",
          styles.layer,
          styles.aura,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-card r-card-lg",
          styles.layer,
          styles.neon,
        )}
        aria-hidden
      />
      {children}
    </span>
  );
}

function PillarsSelector(
  { pillars: pillars0 = [], commitMeta }: PillarsSelectorProps,
  ref: React.Ref<PillarsSelectorHandle>,
) {
  const [pillars, setPillars] = React.useState<Pillar[]>(pillars0);

  React.useEffect(() => {
    setPillars(Array.isArray(pillars0) ? [...pillars0] : []);
  }, [pillars0]);

  const togglePillar = React.useCallback(
    (p: Pillar) => {
      setPillars((prev) => {
        const has = prev.includes(p);
        const next = has ? prev.filter((x) => x !== p) : prev.concat(p);
        commitMeta({ pillars: next });
        return next;
      });
    },
    [commitMeta],
  );

  const save = React.useCallback(() => {
    commitMeta({ pillars });
  }, [pillars, commitMeta]);

  React.useImperativeHandle(ref, () => ({ save }), [save]);

  function onIconKey(e: React.KeyboardEvent, handler: () => void) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  }

  return (
    <div>
      <SectionLabel>Pillars</SectionLabel>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {ALL_PILLARS.map((p) => {
          const active = pillars.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => togglePillar(p)}
              onKeyDown={(e) => onIconKey(e, () => togglePillar(p))}
              aria-pressed={active}
              className="rounded-[var(--radius-2xl)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={active ? `${p} selected` : `Select ${p}`}
            >
              <NeonPillarChip active={active}>
                <PillarBadge pillar={p} size="md" active={active} as="span" />
              </NeonPillarChip>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PillarsSelectorComponent = React.forwardRef(PillarsSelector)

export { PillarsSelectorComponent as PillarsSelector }
