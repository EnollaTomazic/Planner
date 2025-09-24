"use client";

import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import NeonIcon from "@/components/reviews/NeonIcon";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import Badge from "@/components/ui/primitives/Badge";
import { Plus, FileText, Trash2 } from "lucide-react";
import { uid, usePersistentState } from "@/lib/db";
import { formatMmSs, parseMmSs } from "@/lib/date";
import type { Review, ReviewMarker } from "@/lib/types";
import {
  LAST_MARKER_MODE_KEY,
  LAST_MARKER_TIME_KEY,
} from "@/components/reviews/reviewData";
import ReviewSurface from "./ReviewSurface";

export type TimestampMarkersHandle = {
  save: () => void;
  focusTime: () => void;
};

type TimestampMarkersProps = {
  markers?: ReviewMarker[];
  commitMeta: (patch: Partial<Review>) => void;
};

function normalizeMarker(m: unknown): ReviewMarker {
  const obj = m as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : uid("mark");
  const seconds =
    typeof obj.seconds === "number"
      ? obj.seconds
      : typeof obj.time === "string"
      ? parseMmSs(obj.time) ?? 0
      : 0;
  const time =
    typeof obj.time === "string" ? obj.time : formatMmSs(seconds);
  const note = typeof obj.note === "string" ? obj.note : "";
  const noteOnly = Boolean(obj.noteOnly);
  return { id, seconds, time, note, noteOnly };
}

function TimestampMarkers(
  { markers: markers0 = [], commitMeta }: TimestampMarkersProps,
  ref: React.Ref<TimestampMarkersHandle>,
) {
  const [lastMarkerMode, setLastMarkerMode] = usePersistentState<boolean>(
    LAST_MARKER_MODE_KEY,
    true,
  );
  const [lastMarkerTime, setLastMarkerTime] = usePersistentState<string>(
    LAST_MARKER_TIME_KEY,
    "",
  );

  const [markers, setMarkers] = React.useState<ReviewMarker[]>(
    Array.isArray(markers0) ? markers0.map(normalizeMarker) : [],
  );
  const [useTimestamp, setUseTimestamp] = React.useState(lastMarkerMode);
  const [tTime, setTTime] = React.useState(lastMarkerTime);
  const [tNote, setTNote] = React.useState("");

  React.useEffect(() => {
    setMarkers(Array.isArray(markers0) ? markers0.map(normalizeMarker) : []);
  }, [markers0]);

  const timeRef = React.useRef<HTMLInputElement>(null);
  const noteRef = React.useRef<HTMLInputElement>(null);

  const parsedTime = parseMmSs(tTime);
  const timeError = useTimestamp && parsedTime === null;
  const canAddMarker =
    (useTimestamp ? parsedTime !== null : true) && tNote.trim().length > 0;

  const sortedMarkers = React.useMemo(
    () => [...markers].sort((a, b) => a.seconds - b.seconds),
    [markers],
  );

  const addMarker = React.useCallback(() => {
    const s = useTimestamp ? parsedTime : 0;
    const safeS = s === null ? 0 : s;
    const m: ReviewMarker = {
      id: uid("mark"),
      time: useTimestamp ? tTime.trim() || "00:00" : "00:00",
      seconds: safeS,
      note: tNote.trim(),
      noteOnly: !useTimestamp,
    };
    const next = [...markers, m];
    setMarkers(next);
    commitMeta({ markers: next });
    setTTime("");
    setTNote("");
    (useTimestamp ? timeRef : noteRef).current?.focus();
  }, [useTimestamp, parsedTime, tTime, tNote, markers, commitMeta]);

  const removeMarker = React.useCallback(
    (id: string) => {
      const next = markers.filter((m) => m.id !== id);
      setMarkers(next);
      commitMeta({ markers: next });
    },
    [markers, commitMeta],
  );

  const save = React.useCallback(() => {
    commitMeta({ markers });
  }, [markers, commitMeta]);

  React.useImperativeHandle(
    ref,
    () => ({
      save,
      focusTime: () => timeRef.current?.focus(),
    }),
    [save],
  );

  return (
    <div>
      <SectionLabel>Timestamps</SectionLabel>
      <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)]">
        <IconButton
          aria-label="Use timestamp"
          title="Timestamp mode"
          aria-pressed={useTimestamp}
          size="xl"
          variant="ghost"
          tone="primary"
          onClick={() => {
            setUseTimestamp(true);
            setLastMarkerMode(true);
            setTTime(lastMarkerTime);
          }}
        >
          <NeonIcon kind="clock" on={useTimestamp} size="xl" />
        </IconButton>

        <IconButton
          aria-label="Use note only"
          title="Note-only mode"
          aria-pressed={!useTimestamp}
          size="xl"
          variant="ghost"
          tone="accent"
          onClick={() => {
            setUseTimestamp(false);
            setLastMarkerMode(false);
          }}
        >
          <NeonIcon kind="file" on={!useTimestamp} size="xl" />
        </IconButton>
      </div>

      <div className="mt-[var(--space-3)] grid gap-[var(--space-2)]">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-[var(--space-2)]">
          {useTimestamp ? (
            <Input
              ref={timeRef}
              name="timestamp-time"
              value={tTime}
              onChange={(e) => {
                setTTime(e.target.value);
                setLastMarkerTime(e.target.value);
              }}
              placeholder="00:00"
              className="text-center font-mono tabular-nums"
              aria-label="Timestamp time in mm:ss"
              inputMode="numeric"
              pattern="^[0-9]?\d:[0-5]\d$"
              aria-invalid={timeError ? "true" : undefined}
              aria-describedby={timeError ? "tTime-error" : undefined}
              style={{
                width: "calc(5ch + var(--space-5) + (var(--space-1) * 4 / 5))",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canAddMarker) {
                  e.preventDefault();
                  addMarker();
                }
              }}
            />
          ) : (
            <Badge
              as="span"
              size="md"
              className="min-w-[var(--space-8)] justify-center text-ui"
            >
              <FileText aria-hidden className="icon-xs opacity-80" />
            </Badge>
          )}

          <Input
            ref={noteRef}
            name="timestamp-note"
            value={tNote}
            onChange={(e) => setTNote(e.target.value)}
            placeholder="Quick note"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAddMarker) {
                e.preventDefault();
                addMarker();
              }
            }}
            aria-label="Timestamp note"
          />

          <IconButton
            aria-label="Add timestamp"
            title={canAddMarker ? "Add timestamp" : "Enter details"}
            size="md"
            iconSize="sm"
            variant="primary"
            disabled={!canAddMarker}
            onClick={addMarker}
          >
            <Plus />
          </IconButton>
        </div>
        {timeError && (
          <p id="tTime-error" className="mt-[var(--space-1)] text-ui text-danger">
            Enter time as mm:ss
          </p>
        )}

        {sortedMarkers.length === 0 ? (
          <div className="mt-[var(--space-2)] text-ui text-muted-foreground">No timestamps yet.</div>
        ) : (
          <ul className="mt-[var(--space-3)] space-y-[var(--space-2)]">
            {sortedMarkers.map((m) => (
              <ReviewSurface
                as="li"
                key={m.id}
                padding="sm"
                className="grid grid-cols-[auto_1fr_auto] items-center gap-[var(--space-2)]"
              >
                {m.noteOnly ? (
                  <Badge
                    as="span"
                    size="md"
                    className="min-w-[var(--space-8)] justify-center text-ui"
                  >
                    <FileText aria-hidden className="icon-xs opacity-80" />
                  </Badge>
                ) : (
                  <Badge
                    as="span"
                    size="md"
                    className="min-w-[var(--space-8)] justify-center font-mono tabular-nums text-ui"
                  >
                    {m.time}
                  </Badge>
                )}

                <span className="truncate text-ui">{m.note}</span>
                <IconButton
                  aria-label="Delete timestamp"
                  title="Delete timestamp"
                  size="sm"
                  iconSize="sm"
                  variant="ghost"
                  onClick={() => removeMarker(m.id)}
                >
                  <Trash2 />
                </IconButton>
              </ReviewSurface>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default React.forwardRef(TimestampMarkers);
