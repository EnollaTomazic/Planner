"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { SectionLabel } from "@/components/reviews/SectionLabel";
import { AnimatedSelect, Badge, IconButton } from "@/components/ui";
import { ALL_PILLARS } from "@/components/reviews/reviewData";
import { PILLAR_ICONS, pillarToLabel } from "@/lib/pillarDetails";
import type { Pillar, Review } from "@/lib/types";

export type PillarsSelectorHandle = {
  save: () => void;
};

type PillarsSelectorProps = {
  pillars?: Pillar[];
  commitMeta: (patch: Partial<Review>) => void;
};

function PillarsSelector(
  { pillars: pillars0 = [], commitMeta }: PillarsSelectorProps,
  ref: React.Ref<PillarsSelectorHandle>,
) {
  const [pillars, setPillars] = React.useState<Pillar[]>(pillars0);

  React.useEffect(() => {
    setPillars(Array.isArray(pillars0) ? [...pillars0] : []);
  }, [pillars0]);

  const togglePillar = React.useCallback(
    (pillar: Pillar) => {
      setPillars((prev) => {
        const has = prev.includes(pillar);
        const next = has ? prev.filter((value) => value !== pillar) : prev.concat(pillar);
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

  const handleSelect = React.useCallback(
    (value: string) => {
      if (!ALL_PILLARS.includes(value as Pillar)) return;
      togglePillar(value as Pillar);
    },
    [togglePillar],
  );

  const selectItems = React.useMemo(
    () =>
      ALL_PILLARS.map((pillar) => {
        const Icon = PILLAR_ICONS[pillar];
        const active = pillars.includes(pillar);
        return {
          value: pillar,
          label: (
            <span className="flex w-full items-center gap-[var(--space-2)]">
              <Icon
                aria-hidden
                className="h-[var(--space-4)] w-[var(--space-4)] text-muted-foreground"
              />
              <span className="flex-1 text-left">{pillarToLabel(pillar)}</span>
              {active ? (
                <Check
                  aria-hidden
                  className="h-[var(--space-4)] w-[var(--space-4)] text-accent"
                />
              ) : null}
            </span>
          ),
        };
      }),
    [pillars],
  );

  const selectedPillars = pillars.length > 0 ? pillars : null;

  return (
    <div>
      <SectionLabel>Pillars</SectionLabel>
      <AnimatedSelect
        items={selectItems}
        value={selectedPillars?.[0]}
        onChange={handleSelect}
        placeholder="Add or remove pillars"
        ariaLabel="Select pillars"
        matchTriggerWidth
      />
      <div className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-2)]">
        {selectedPillars ? (
          selectedPillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar];
            return (
              <Badge key={pillar} className="gap-[var(--space-1)] bg-card/70">
                <Icon
                  aria-hidden
                  className="h-[var(--space-4)] w-[var(--space-4)] text-muted-foreground"
                />
                <span>{pillarToLabel(pillar)}</span>
                <IconButton
                  size="sm"
                  iconSize="sm"
                  variant="quiet"
                  aria-label={`Remove ${pillarToLabel(pillar)}`}
                  onClick={() => togglePillar(pillar)}
                  className="-mr-[var(--space-2)] text-muted-foreground hover:text-foreground"
                >
                  <X aria-hidden className="h-[var(--space-3)] w-[var(--space-3)]" />
                </IconButton>
              </Badge>
            );
          })
        ) : (
          <div className="text-ui text-muted-foreground">
            No pillars selected.
          </div>
        )}
      </div>
    </div>
  );
}

const PillarsSelectorComponent = React.forwardRef<
  PillarsSelectorHandle,
  PillarsSelectorProps
>(PillarsSelector);

PillarsSelectorComponent.displayName = "PillarsSelector";

export { PillarsSelectorComponent as PillarsSelector };
