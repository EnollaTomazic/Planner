"use client";

// Full Review Editor with icon-only header actions and RoleSelector rail control.
import "./style.css";

import * as React from "react";
import type { Review, Pillar, Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { uid, usePersistentState } from "@/lib/db";
import {
  LAST_ROLE_KEY,
  SCORE_POOLS,
  FOCUS_POOLS,
  pickIndex,
  scoreIcon,
} from "@/components/reviews/reviewData";
import ReviewMetaControls, {
  MetaPatch,
  Result,
} from "@/components/reviews/ReviewMetaControls";
import ReviewNotesTags from "@/components/reviews/ReviewNotesTags";
import ReviewMarkerEditor, {
  Marker,
} from "@/components/reviews/ReviewMarkerEditor";
import { parseTime, formatSeconds } from "@/components/reviews/utils";

function getExt(r: Review) {
  return r as unknown as Partial<{
    result?: Result;
    score?: number;
    role?: Role;
    markers?: Marker[];
    focusOn?: boolean;
    focus?: number;
  }>;
}
function normalizeMarker(m: unknown): Marker {
  const obj = (typeof m === "object" && m !== null ? m : {}) as Record<
    string,
    unknown
  >;
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

  const [markers, setMarkers] = React.useState<Marker[]>(
    Array.isArray(ext0.markers) ? ext0.markers.map(normalizeMarker) : [],
  );

  const laneRef = React.useRef<HTMLInputElement>(null);
  const opponentRef = React.useRef<HTMLInputElement>(null);
  const resultRef = React.useRef<HTMLButtonElement>(null);
  const scoreRangeRef = React.useRef<HTMLInputElement>(null);
  const focusRangeRef = React.useRef<HTMLInputElement>(null);

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
  function addTag(tagRaw: string) {
    const t = tagRaw.trim().replace(/^#/, "");
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    onChangeTags?.(next);
  }
  function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    onChangeTags?.(next);
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

  const selectRole = (v: Role) => {
    setRole(v);
    setLastRole(v);
    commitMeta({ role: v });
  };

  return (
    <div
      ref={rootRef}
      className={cn("card-neo-soft r-card-lg overflow-hidden transition-none", className)}
    >
      <ReviewMetaControls
        lane={lane}
        setLane={setLane}
        laneRef={laneRef}
        commitLaneAndTitle={commitLaneAndTitle}
        opponent={opponent}
        setOpponent={setOpponent}
        opponentRef={opponentRef}
        commitMeta={commitMeta}
        role={role}
        selectRole={selectRole}
        pillars={pillars}
        togglePillar={togglePillar}
        result={result}
        setResult={setResult}
        resultRef={resultRef}
        score={score}
        setScore={setScore}
        scoreRangeRef={scoreRangeRef}
        msg={msg}
        ScoreIcon={ScoreIcon}
        scoreIconCls={scoreIconCls}
        focusOn={focusOn}
        setFocusOn={setFocusOn}
        focus={focus}
        setFocus={setFocus}
        focusRangeRef={focusRangeRef}
        focusMsg={focusMsg}
        onDelete={onDelete}
        onDone={onDone}
        saveAll={saveAll}
      />
      <div className="section-b ds-card-pad space-y-6">
        <ReviewMarkerEditor
          markers={markers}
          onChange={(next) => {
            setMarkers(next);
            commitMeta({ markers: next });
          }}
        />
        <ReviewNotesTags
          notes={notes}
          onNotesChange={setNotes}
          onNotesBlur={commitNotes}
          tags={tags}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />
      </div>
    </div>
  );
}
