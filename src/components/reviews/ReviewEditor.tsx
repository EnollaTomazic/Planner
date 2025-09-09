"use client";

// Full Review Editor with icon-only header actions and RoleSelector rail control.
import "./style.css";
import { RoleSelector } from "@/components/reviews";
import SectionLabel from "@/components/reviews/SectionLabel";
import ReviewMetadata from "@/components/reviews/ReviewMetadata";
import ReviewNotesTags from "@/components/reviews/ReviewNotesTags";
import ReviewMarkerEditor from "@/components/reviews/ReviewMarkerEditor";

import * as React from "react";
import type { Review, Pillar, Role, ReviewMarker } from "@/lib/types";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import { Trash2, Check, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { uid, usePersistentState } from "@/lib/db";
import {
  LAST_ROLE_KEY,
  LAST_MARKER_MODE_KEY,
  LAST_MARKER_TIME_KEY,
  SCORE_POOLS,
  FOCUS_POOLS,
  pickIndex,
  scoreIcon,
} from "@/components/reviews/reviewData";
import { parseTime, formatSeconds, type Result } from "@/components/reviews/utils";


type ExtendedProps = {
  result?: Result;
  score?: number;
  role?: Role;
  markers?: ReviewMarker[];
  focusOn?: boolean;
  focus?: number;
};

type MetaPatch = Omit<Partial<Review>, "role"> & Partial<ExtendedProps>;

function getExt(r: Review): Partial<ExtendedProps> {
  return r as unknown as Partial<ExtendedProps>;
}
function normalizeMarker(m: unknown): ReviewMarker {
  const obj = (typeof m === "object" && m !== null ? m : {}) as Record<string, unknown>;
  const asNum = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : undefined;
  const asStr = (v: unknown) => (typeof v === "string" ? v : undefined);

  const seconds =
    asNum(obj.seconds) ?? (asStr(obj.time) ? parseTime(asStr(obj.time)!) ?? 0 : 0);

  const timeStr = asStr(obj.time) ?? formatSeconds(seconds);
  return {
    id: asStr(obj.id) ?? uid("mark"),
    time: timeStr,
    seconds,
    note: asStr(obj.note) ?? "",
    noteOnly: Boolean(obj.noteOnly),
  };
}

export default function ReviewEditor({
  review,
  onChangeNotes,
  onChangeTags,
  onRename,
  onChangeMeta,
  onDone,
  onDelete,
  className = "",
}: {
  review: Review;
  onChangeNotes?: (value: string) => void;
  onChangeTags?: (values: string[]) => void;
  onRename?: (title: string) => void;
  onChangeMeta?: (partial: MetaPatch) => void;
  onDone?: () => void;
  onDelete?: () => void;
  className?: string;
}) {
  const [notes, setNotes] = React.useState(review.notes ?? "");
  const [tags, setTags] = React.useState<string[]>(
    Array.isArray(review.tags) ? review.tags : [],
  );

  const rootRef = React.useRef<HTMLDivElement>(null);

  const [opponent, setOpponent] = React.useState(review.opponent ?? "");
  const [lane, setLane] = React.useState(review.lane ?? review.title ?? "");
  const [pillars, setPillars] = React.useState<Pillar[]>(
    Array.isArray(review.pillars) ? review.pillars : [],
  );

  const [lastRole, setLastRole] = usePersistentState<Role>(LAST_ROLE_KEY, "MID");
  const [lastMarkerMode, setLastMarkerMode] = usePersistentState<boolean>(
    LAST_MARKER_MODE_KEY,
    true,
  );
  const [lastMarkerTime, setLastMarkerTime] = usePersistentState<string>(
    LAST_MARKER_TIME_KEY,
    "",
  );
  const ext0 = getExt(review);
  const initialRole: Role = ext0.role ?? lastRole ?? "MID";
  const [role, setRole] = React.useState<Role>(initialRole);

  const [result, setResult] = React.useState<Result>(ext0.result ?? "Win");
  const [score, setScore] = React.useState<number>(
    Number.isFinite(ext0.score ?? NaN) ? Number(ext0.score) : 5,
  );

  const [focusOn, setFocusOn] = React.useState<boolean>(Boolean(ext0.focusOn));
  const [focus, setFocus] = React.useState<number>(
    Number.isFinite(ext0.focus ?? NaN) ? Number(ext0.focus) : 5,
  );

  const [markers, setMarkers] = React.useState<ReviewMarker[]>(
    Array.isArray(ext0.markers) ? ext0.markers.map(normalizeMarker) : [],
  );

  const laneRef = React.useRef<HTMLInputElement>(null);
  const opponentRef = React.useRef<HTMLInputElement>(null);
  const resultRef = React.useRef<HTMLButtonElement>(null);
  const timeRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const ext = getExt(review);
    setNotes(review.notes ?? "");
    setTags(Array.isArray(review.tags) ? review.tags : []);

    setOpponent(review.opponent ?? "");
    setLane(review.lane ?? review.title ?? "");
    setPillars(Array.isArray(review.pillars) ? review.pillars : []);

    setResult(ext.result ?? "Win");
    setScore(Number.isFinite(ext.score ?? NaN) ? Number(ext.score) : 5);

    const r = ext.role ?? lastRole ?? "MID";
    setRole(r);
    if (ext.role == null) {
      onChangeMeta?.({ role: r });
    }

    setFocusOn(Boolean(ext.focusOn));
    setFocus(Number.isFinite(ext.focus ?? NaN) ? Number(ext.focus) : 5);

    setMarkers(Array.isArray(ext.markers) ? ext.markers.map(normalizeMarker) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review.id]);

  const commitMeta = (partial: MetaPatch) => onChangeMeta?.(partial);
  const commitLaneAndTitle = () => {
    const t = (lane || "").trim();
    onRename?.(t);
    commitMeta({ lane: t });
  };
  const commitNotes = () => onChangeNotes?.(notes);

  function saveAll() {
    commitLaneAndTitle();
    commitNotes();
    onChangeTags?.(tags);
    onChangeMeta?.({
      opponent,
      pillars,
      result,
      score,
      role,
      markers,
      focusOn,
      focus,
    });
  }

  const saveAllRef = React.useRef(saveAll);
  saveAllRef.current = saveAll;

  React.useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        saveAllRef.current();
        onDone?.();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onDone]);

  function togglePillar(p: Pillar) {
    setPillars((prev) => {
      const has = prev.includes(p);
      const next = has ? prev.filter((x) => x !== p) : prev.concat(p);
      commitMeta({ pillars: next });
      return next;
    });
  }

  const msgIndex = pickIndex(String(review.id ?? "seed") + String(score), 5);
  const pool = SCORE_POOLS[score] ?? SCORE_POOLS[5];
  const msg = pool[msgIndex];
  const { Icon: ScoreIcon, cls: scoreIconCls } = scoreIcon(score);

  const focusMsgIndex = pickIndex(
    String(review.id ?? "seed-focus") + String(focus),
    10,
  );
  const focusMsg = (FOCUS_POOLS[focus] ?? FOCUS_POOLS[5])[focusMsgIndex % 10];

  const go = (ref: React.RefObject<HTMLElement>) => ref.current?.focus();

  function selectRole(v: Role) {
    setRole(v);
    setLastRole(v); // persist globally
    commitMeta({ role: v });
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "card-neo-soft r-card-lg overflow-hidden transition-none",
        className,
      )}
    >
      <div className="section-h sticky">
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-2">
              <SectionLabel>Lane</SectionLabel>
              <RoleSelector value={role} onChange={selectRole} />
            </div>

            <div className="mb-2">
              <div className="relative">
                <Target className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={laneRef}
                  value={lane}
                  onChange={(e) => setLane(e.target.value)}
                  onBlur={commitLaneAndTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitLaneAndTitle();
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
                <Shield className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={opponentRef}
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  onBlur={() => commitMeta({ opponent })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      go(resultRef);
                    }
                  }}
                  placeholder="Draven/Thresh"
                  className="pl-6"
                  aria-label="Opponent"
                />
              </div>
            </div>
          </div>

          <div className="ml-2 flex shrink-0 items-center justify-end gap-2 self-start">
            {onDelete ? (
              <IconButton
                aria-label="Delete review"
                title="Delete review"
                size="md"
                iconSize="md"
                variant="ring"
                onClick={onDelete}
              >
                <Trash2 />
              </IconButton>
            ) : null}

            {onDone ? (
              <IconButton
                aria-label="Done"
                title="Save and close"
                size="md"
                iconSize="md"
                variant="ring"
                onClick={() => {
                  saveAll();
                  onDone?.();
                }}
              >
                <Check />
              </IconButton>
            ) : null}
          </div>
        </div>
      </div>

      <div className="section-b ds-card-pad space-y-6">
        <ReviewMetadata
          result={result}
          onChangeResult={(r) => {
            setResult(r);
            commitMeta({ result: r });
          }}
          score={score}
          onChangeScore={(v) => {
            setScore(v);
            commitMeta({ score: v });
          }}
          focusOn={focusOn}
          onToggleFocus={(v) => {
            setFocusOn(v);
            commitMeta({ focusOn: v });
          }}
          focus={focus}
          onChangeFocus={(v) => {
            setFocus(v);
            commitMeta({ focus: v });
          }}
          pillars={pillars}
          togglePillar={togglePillar}
          scoreMsg={msg}
          ScoreIcon={ScoreIcon}
          scoreIconCls={scoreIconCls}
          focusMsg={focusMsg}
          onScoreNext={() => timeRef.current?.focus()}
          resultRef={resultRef}
        />

        <ReviewMarkerEditor
          markers={markers}
          onChange={(next) => {
            setMarkers(next);
            commitMeta({ markers: next });
          }}
          timeRef={timeRef}
          lastMarkerMode={lastMarkerMode}
          setLastMarkerMode={setLastMarkerMode}
          lastMarkerTime={lastMarkerTime}
          setLastMarkerTime={setLastMarkerTime}
        />

        <ReviewNotesTags
          notes={notes}
          onNotesChange={setNotes}
          onNotesBlur={commitNotes}
          tags={tags}
          onTagsChange={(next) => {
            setTags(next);
            onChangeTags?.(next);
          }}
        />
      </div>
    </div>
  );
}
