"use client";

// Full Review Editor with icon-only header actions and RoleSelector rail control.
import { RoleSelector } from "@/components/reviews";
import SectionLabel from "@/components/reviews/SectionLabel";
import SectionCard from "@/components/ui/layout/SectionCard";
import NeonIcon from "@/components/reviews/NeonIcon";

import * as React from "react";
import type { Review, Role } from "@/lib/types";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import IconButton from "@/components/ui/primitives/IconButton";
import { Tag, Trash2, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/lib/db";
import {
  LAST_ROLE_KEY,
  FOCUS_POOLS,
  pickIndex,
} from "@/components/reviews/reviewData";

import LaneOpponentForm, { LaneOpponentFormHandle } from "./LaneOpponentForm";
import ResultScoreSection, {
  ResultScoreSectionHandle,
} from "./ResultScoreSection";
import PillarsSelector, { PillarsSelectorHandle } from "./PillarsSelector";
import TimestampMarkers, { TimestampMarkersHandle } from "./TimestampMarkers";

type ReviewEditorProps = {
  review: Review;
  onChangeNotes?: (value: string) => void;
  onChangeTags?: (values: string[]) => void;
  onRename?: (title: string) => void;
  onChangeMeta?: (partial: Partial<Review>) => void;
  onDone?: () => void;
  onDelete?: () => void;
  className?: string;
};

export default function ReviewEditor({
  review,
  onChangeNotes,
  onChangeTags,
  onRename,
  onChangeMeta,
  onDone,
  onDelete,
  className = "",
}: ReviewEditorProps) {
  const [notes, setNotes] = React.useState(review.notes ?? "");
  const [tags, setTags] = React.useState<string[]>(
    Array.isArray(review.tags) ? review.tags : [],
  );
  const [draftTag, setDraftTag] = React.useState("");

  const rootRef = React.useRef<HTMLElement>(null);
  const laneFormRef = React.useRef<LaneOpponentFormHandle>(null);
  const resultScoreRef = React.useRef<ResultScoreSectionHandle>(null);
  const pillarsRef = React.useRef<PillarsSelectorHandle>(null);
  const timestampsRef = React.useRef<TimestampMarkersHandle>(null);
  const focusRangeRef = React.useRef<HTMLInputElement>(null);

  const [lastRole, setLastRole] = usePersistentState<Role>(
    LAST_ROLE_KEY,
    "MID",
  );
  const [role, setRole] = React.useState<Role>(
    review.role ?? lastRole ?? "MID",
  );
  const [focusOn, setFocusOn] = React.useState<boolean>(
    Boolean(review.focusOn),
  );
  const [focus, setFocus] = React.useState<number>(
    Number.isFinite(review.focus ?? NaN) ? Number(review.focus) : 5,
  );

  React.useEffect(() => {
    setNotes(review.notes ?? "");
    setTags(Array.isArray(review.tags) ? review.tags : []);
    setDraftTag("");

    const r = review.role ?? lastRole ?? "MID";
    setRole(r);
    if (review.role == null) {
      onChangeMeta?.({ role: r });
    }

    setFocusOn(Boolean(review.focusOn));
    setFocus(Number.isFinite(review.focus ?? NaN) ? Number(review.focus) : 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review.id]);

  const commitMeta = (partial: Partial<Review>) => onChangeMeta?.(partial);
  const commitNotes = () => onChangeNotes?.(notes);

  function saveAll() {
    laneFormRef.current?.save();
    resultScoreRef.current?.save();
    pillarsRef.current?.save();
    timestampsRef.current?.save();
    commitNotes();
    onChangeTags?.(tags);
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

  const focusMsgIndex = pickIndex(
    String(review.id ?? "seed-focus") + String(focus),
    10,
  );
  const focusMsg = (FOCUS_POOLS[focus] ?? FOCUS_POOLS[5])[focusMsgIndex % 10];

  function selectRole(v: Role) {
    setRole(v);
    setLastRole(v);
    commitMeta({ role: v });
  }

  function onIconKey(e: React.KeyboardEvent, handler: () => void) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  }

  return (
    <SectionCard
      ref={rootRef}
      variant="plain"
      className={cn("transition-none shadow-none", className)}
    >
      <div className="section-h sticky">
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-2">
              <SectionLabel>Lane</SectionLabel>
              <RoleSelector value={role} onChange={selectRole} />
            </div>

            <LaneOpponentForm
              ref={laneFormRef}
              lane={review.lane ?? review.title ?? ""}
              opponent={review.opponent ?? ""}
              commitMeta={commitMeta}
              onRename={onRename}
              onOpponentEnter={() => resultScoreRef.current?.focusResult()}
            />
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
        <ResultScoreSection
          ref={resultScoreRef}
          result={review.result ?? "Win"}
          score={
            Number.isFinite(review.score ?? NaN) ? Number(review.score) : 5
          }
          commitMeta={commitMeta}
          onScoreEnter={() => timestampsRef.current?.focusTime()}
        />

        {/* Focus */}
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={focusOn ? "Brain light on" : "Brain light off"}
              aria-pressed={focusOn}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                const v = !focusOn;
                setFocusOn(v);
                commitMeta({ focusOn: v });
                if (v) focusRangeRef.current?.focus();
              }}
              onKeyDown={(e) =>
                onIconKey(e, () => {
                  const v = !focusOn;
                  setFocusOn(v);
                  commitMeta({ focusOn: v });
                  if (v) focusRangeRef.current?.focus();
                })
              }
            >
              <NeonIcon kind="brain" on={focusOn} size={32} />
            </button>
          </div>

          {focusOn && (
            <>
              <div className="mt-3 relative h-12 rounded-card r-card-lg border border-border bg-card px-4 focus-within:ring-2 focus-within:ring-ring">
                <input
                  ref={focusRangeRef}
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={focus}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFocus(v);
                    commitMeta({ focus: v });
                  }}
                  className="absolute inset-0 z-10 cursor-pointer rounded-card r-card-lg opacity-0 [appearance:none]"
                  aria-label="Focus from 0 to 10"
                />
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
                  <div className="relative h-2 w-full rounded-full bg-muted shadow-neo-inset">
                    <div
                      className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-accent to-primary shadow-ring [--ring:var(--accent)]"
                      style={{
                        width: `calc(${(focus / 10) * 100}% + var(--space-2) + var(--space-1) / 2)`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-border bg-card shadow-neoSoft"
                      style={{
                        left: `calc(${(focus / 10) * 100}% - (var(--space-2) + var(--space-1) / 2))`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="pill h-6 px-2 text-xs">{focus}/10</span>
                <span>{focusMsg}</span>
              </div>
            </>
          )}
        </div>

        <PillarsSelector
          ref={pillarsRef}
          pillars={Array.isArray(review.pillars) ? review.pillars : []}
          commitMeta={commitMeta}
        />

        <TimestampMarkers
          ref={timestampsRef}
          markers={Array.isArray(review.markers) ? review.markers : []}
          commitMeta={commitMeta}
        />

        {/* Tags */}
        <div>
          <SectionLabel>Tags</SectionLabel>
          <div className="mt-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="tag-input"
                value={draftTag}
                onChange={(e) => setDraftTag(e.target.value)}
                placeholder="Add tag and press Enter"
                className="pl-6"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(draftTag);
                    setDraftTag("");
                  }
                }}
              />
            </div>

            <IconButton
              aria-label="Add tag"
              title="Add tag"
              size="md"
              iconSize="sm"
              variant="solid"
              onClick={() => {
                addTag(draftTag);
                setDraftTag("");
              }}
            >
              <Plus />
            </IconButton>
          </div>

          {tags.length === 0 ? (
            <div className="mt-2 text-sm text-muted-foreground/80">
              No tags yet.
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="chip h-9 px-4 text-sm group inline-flex items-center gap-1"
                  title="Remove tag"
                  onClick={() => removeTag(t)}
                >
                  <span>#{t}</span>
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">
                    ✕
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <SectionLabel>Notes</SectionLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={commitNotes}
            placeholder="Key moments, mistakes to fix, drills to run…"
            className="rounded-[var(--radius-2xl)]"
            resize="resize-y"
            textareaClassName="min-h-[calc(var(--space-8)*3_-_var(--space-3))] leading-relaxed"
          />
        </div>
      </div>
    </SectionCard>
  );
}
