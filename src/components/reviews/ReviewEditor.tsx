"use client";

// Full Review Editor with icon-only header actions and RoleSelector rail control.
import { RoleSelector } from "@/components/reviews";
import SectionLabel from "@/components/reviews/SectionLabel";
import SectionCard from "@/components/ui/layout/SectionCard";
import NeonIcon from "@/components/reviews/NeonIcon";
import ReviewSurface from "./ReviewSurface";
import ReviewSliderTrack from "./ReviewSliderTrack";

import * as React from "react";
import type { Review, Role } from "@/lib/types";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import IconButton from "@/components/ui/primitives/IconButton";
import Badge from "@/components/ui/primitives/Badge";
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
  const laneLabelId = React.useId();
  const tagsLabelId = React.useId();
  const notesLabelId = React.useId();

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
  }, [review.id, review.notes]);

  React.useEffect(() => {
    setTags(Array.isArray(review.tags) ? review.tags : []);
    setDraftTag("");
  }, [review.id, review.tags]);

  React.useEffect(() => {
    const r = review.role ?? lastRole ?? "MID";
    setRole(r);
    if (review.role == null) {
      onChangeMeta?.({ role: r });
    }
  }, [lastRole, onChangeMeta, review.id, review.role]);

  React.useEffect(() => {
    setFocusOn(Boolean(review.focusOn));
    setFocus(Number.isFinite(review.focus ?? NaN) ? Number(review.focus) : 5);
  }, [review.focus, review.focusOn, review.id]);

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

  return (
    <SectionCard
      ref={rootRef}
      variant="plain"
      className={cn("transition-none shadow-none", className)}
    >
      <div className="section-h sticky">
        <div className="grid w-full grid-cols-[1fr_auto] items-center gap-[var(--space-4)]">
          <div className="min-w-0">
            <div className="mb-[var(--space-2)]">
              <SectionLabel id={laneLabelId}>Lane</SectionLabel>
              <RoleSelector
                value={role}
                onChange={selectRole}
                ariaLabelledby={laneLabelId}
              />
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

          <div className="ml-[var(--space-2)] flex shrink-0 items-center justify-end gap-[var(--space-2)] self-start">
            {onDelete ? (
              <IconButton
                aria-label="Delete review"
                title="Delete review"
                size="lg"
                iconSize="md"
                variant="ghost"
                onClick={onDelete}
              >
                <Trash2 />
              </IconButton>
            ) : null}

            {onDone ? (
              <IconButton
                aria-label="Done"
                title="Save and close"
                size="lg"
                iconSize="md"
                variant="ghost"
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

      <div className="section-b ds-card-pad space-y-[var(--space-6)]">
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
          <div className="flex items-center gap-[var(--space-3)]">
            <IconButton
              aria-label={focusOn ? "Brain light on" : "Brain light off"}
              title={focusOn ? "Brain light on" : "Brain light off"}
              aria-pressed={focusOn}
              size="xl"
              variant="ghost"
              tone="primary"
              onClick={() => {
                const v = !focusOn;
                setFocusOn(v);
                commitMeta({ focusOn: v });
                if (v) focusRangeRef.current?.focus();
              }}
            >
              <NeonIcon kind="brain" on={focusOn} size="xl" />
            </IconButton>
          </div>

          {focusOn && (
            <>
              <ReviewSurface
                className="mt-[var(--space-3)] relative h-[var(--space-7)]"
                padding="inline"
                focusWithin
              >
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
                <ReviewSliderTrack
                  value={focus}
                  tone="focus"
                  variant="input"
                />
              </ReviewSurface>
              <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)] text-ui text-muted-foreground">
                <Badge as="span" size="sm" className="font-mono tabular-nums text-ui">
                  {focus}/10
                </Badge>
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
          <SectionLabel id={tagsLabelId}>Tags</SectionLabel>
          <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)]">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-[var(--space-4)] top-1/2 size-[var(--space-4)] -translate-y-1/2 text-muted-foreground" />
              <Input
                name="tag-input"
                value={draftTag}
                onChange={(e) => setDraftTag(e.target.value)}
                placeholder="Add tag and press Enter"
                className="pl-[var(--space-6)]"
                aria-labelledby={tagsLabelId}
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
              variant="primary"
              onClick={() => {
                addTag(draftTag);
                setDraftTag("");
              }}
            >
              <Plus />
            </IconButton>
          </div>

          {tags.length === 0 ? (
            <div className="mt-[var(--space-2)] text-ui text-muted-foreground/80">
              No tags yet.
            </div>
          ) : (
            <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-2)]">
              {tags.map((t) => (
                <Badge
                  key={t}
                  interactive
                  className="group text-ui"
                  title="Remove tag"
                  onClick={() => removeTag(t)}
                >
                  <span>#{t}</span>
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">
                    ✕
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <SectionLabel id={notesLabelId}>Notes</SectionLabel>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={commitNotes}
            placeholder="Key moments, mistakes to fix, drills to run…"
            className="rounded-[var(--control-radius)]"
            resize="resize-y"
            textareaClassName="min-h-[calc(var(--space-8)*3_-_var(--space-3))] leading-relaxed"
            aria-labelledby={notesLabelId}
          />
        </div>
      </div>
    </SectionCard>
  );
}
