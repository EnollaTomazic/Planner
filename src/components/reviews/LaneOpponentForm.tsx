"use client";

import * as React from "react";
import { Label } from "@/components/ui";
import { Input } from "@/components/ui/primitives/Input";
import { Target, Shield } from "lucide-react";
import type { Review } from "@/lib/types";

export type LaneOpponentFormHandle = {
  save: () => void;
};

type LaneOpponentFormProps = {
  lane?: string;
  opponent?: string;
  commitMeta: (patch: Partial<Review>) => void;
  onRename?: (title: string) => void;
  onOpponentEnter?: () => void;
};

function LaneOpponentForm(
  {
    lane: lane0 = "",
    opponent: opponent0 = "",
    commitMeta,
    onRename,
    onOpponentEnter,
  }: LaneOpponentFormProps,
  ref: React.Ref<LaneOpponentFormHandle>,
) {
  const [lane, setLane] = React.useState(lane0);
  const [opponent, setOpponent] = React.useState(opponent0);
  const laneRef = React.useRef<HTMLInputElement>(null);
  const opponentRef = React.useRef<HTMLInputElement>(null);
  const laneInputId = React.useId();
  const opponentInputId = React.useId();
  const opponentLabelId = React.useId();

  React.useEffect(() => {
    setLane(lane0);
  }, [lane0]);

  React.useEffect(() => {
    setOpponent(opponent0);
  }, [opponent0]);

  const commitLane = React.useCallback(() => {
    const t = (lane || "").trim();
    onRename?.(t);
    commitMeta({ lane: t });
  }, [lane, commitMeta, onRename]);

  const commitOpponent = React.useCallback(() => {
    const t = (opponent || "").trim();
    commitMeta({ opponent: t });
  }, [opponent, commitMeta]);

  const save = React.useCallback(() => {
    commitLane();
    commitOpponent();
  }, [commitLane, commitOpponent]);

  React.useImperativeHandle(ref, () => ({ save }), [save]);

  const go = React.useCallback(
    (r: React.RefObject<HTMLInputElement | null>) => {
      r.current?.focus();
    },
    [],
  );

  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <div className="mb-[var(--space-2)] space-y-[var(--space-2)]">
        <Label htmlFor={laneInputId}>Lane</Label>
        <div className="relative">
          <Target className="pointer-events-none absolute left-[var(--space-4)] top-1/2 size-[var(--icon-size-sm)] -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={laneRef}
            name="lane"
            id={laneInputId}
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            onBlur={commitLane}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitLane();
                go(opponentRef);
              }
            }}
            className="pl-[var(--space-6)]"
            placeholder="Ashe/Lulu"
          />
        </div>
      </div>

      <div className="space-y-[var(--space-2)]">
        <Label
          htmlFor={opponentInputId}
          className="flex items-center gap-[var(--space-2)]"
        >
          <span id={opponentLabelId}>Opponent</span>
          <span
            aria-hidden
            className="h-[var(--hairline-w)] flex-1 bg-gradient-to-r from-foreground/20 via-foreground/5 to-transparent"
          />
        </Label>
        <div className="relative">
          <Shield className="pointer-events-none absolute left-[var(--space-4)] top-1/2 size-[var(--icon-size-sm)] -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={opponentRef}
            name="opponent"
            id={opponentInputId}
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            onBlur={commitOpponent}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onOpponentEnter?.();
              }
            }}
            placeholder="Draven/Thresh"
            className="pl-[var(--space-6)]"
            aria-labelledby={opponentLabelId}
          />
        </div>
      </div>
    </div>
  );
}

const LaneOpponentFormComponent = React.forwardRef<
  LaneOpponentFormHandle,
  LaneOpponentFormProps
>(LaneOpponentForm)

LaneOpponentFormComponent.displayName = "LaneOpponentForm"

export { LaneOpponentFormComponent as LaneOpponentForm }
