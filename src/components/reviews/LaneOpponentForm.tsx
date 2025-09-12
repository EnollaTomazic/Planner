import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import Input from "@/components/ui/primitives/Input";
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

  const commitLane = React.useCallback(() => {
    const t = (lane || "").trim();
    onRename?.(t);
    commitMeta({ lane: t });
  }, [lane, commitMeta, onRename]);

  const save = React.useCallback(() => {
    commitLane();
    commitMeta({ opponent });
  }, [commitLane, opponent, commitMeta]);

  React.useImperativeHandle(ref, () => ({ save }), [save]);

  const go = (r: React.RefObject<HTMLInputElement>) => r.current?.focus();

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2">
        <div className="relative">
          <Target className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={laneRef}
            name="lane"
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
            className="pl-6"
            placeholder="Ashe/Lulu"
            aria-label="Lane (used as Title)"
          />
        </div>
      </div>

      <div>
        <SectionLabel>Opponent</SectionLabel>
        <div className="relative">
          <Shield className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={opponentRef}
            name="opponent"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            onBlur={() => commitMeta({ opponent })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onOpponentEnter?.();
              }
            }}
            placeholder="Draven/Thresh"
            className="pl-6"
            aria-label="Opponent"
          />
        </div>
      </div>
    </div>
  );
}

export default React.forwardRef(LaneOpponentForm);
