import * as React from "react";
import { uid } from "@/lib/db";
import Input from "@/components/ui/primitives/Input";
import IconButton from "@/components/ui/primitives/IconButton";
import NeonIcon from "@/components/reviews/NeonIcon";
import { onIconKey, parseTime } from "@/components/reviews/utils";
import { Clock, FileText, Plus, Trash2 } from "lucide-react";
import type { ReviewMarker } from "@/lib/types";

export default function ReviewMarkerEditor({
  markers,
  onChange,
  timeRef,
  lastMarkerMode,
  setLastMarkerMode,
  lastMarkerTime,
  setLastMarkerTime,
}: {
  markers: ReviewMarker[];
  onChange: (next: ReviewMarker[]) => void;
  timeRef: React.RefObject<HTMLInputElement>;
  lastMarkerMode: boolean;
  setLastMarkerMode: (v: boolean) => void;
  lastMarkerTime: string;
  setLastMarkerTime: (v: string) => void;
}) {
  const [useTimestamp, setUseTimestamp] = React.useState(lastMarkerMode);
  const [tTime, setTTime] = React.useState(lastMarkerTime);
  const [tNote, setTNote] = React.useState("");
  const noteRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUseTimestamp(lastMarkerMode);
    setTTime(lastMarkerTime);
  }, [lastMarkerMode, lastMarkerTime]);

  const sortedMarkers = React.useMemo(
    () => [...markers].sort((a, b) => a.seconds - b.seconds),
    [markers],
  );

  const parsedTime = parseTime(tTime);
  const timeError = useTimestamp && parsedTime === null;
  const canAddMarker =
    (useTimestamp ? parsedTime !== null : true) && tNote.trim().length > 0;

  function addMarker() {
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
    onChange(next);
    setTTime("");
    setTNote("");
    (useTimestamp ? timeRef : noteRef).current?.focus();
  }

  function removeMarker(id: string) {
    const next = markers.filter((m) => m.id !== id);
    onChange(next);
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          aria-label="Use timestamp"
          aria-pressed={useTimestamp}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            setUseTimestamp(true);
            setLastMarkerMode(true);
            setTTime(lastMarkerTime);
          }}
          onKeyDown={(e) =>
            onIconKey(e, () => {
              setUseTimestamp(true);
              setLastMarkerMode(true);
              setTTime(lastMarkerTime);
            })
          }
          title="Timestamp mode"
        >
          <NeonIcon kind="clock" on={useTimestamp} />
        </button>

        <button
          type="button"
          aria-label="Use note only"
          aria-pressed={!useTimestamp}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            setUseTimestamp(false);
            setLastMarkerMode(false);
          }}
          onKeyDown={(e) =>
            onIconKey(e, () => {
              setUseTimestamp(false);
              setLastMarkerMode(false);
            })
          }
          title="Note-only mode"
        >
          <NeonIcon kind="file" on={!useTimestamp} />
        </button>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        {useTimestamp ? (
          <Input
            ref={timeRef}
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
            style={{ width: "calc(5ch + 1.7rem)" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAddMarker) {
                e.preventDefault();
                addMarker();
              } else if (e.key === "Enter") {
                e.preventDefault();
                noteRef.current?.focus();
              }
            }}
          />
        ) : (
          <span
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm text-foreground/70"
            style={{ width: "calc(5ch + 1.5rem)" }}
            title="Timestamp disabled"
          >
            <Clock className="h-4 w-4" /> —
          </span>
        )}

        <Input
          ref={noteRef}
          value={tNote}
          onChange={(e) => setTNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAddMarker) {
              e.preventDefault();
              addMarker();
            }
          }}
          placeholder="Note"
          className="rounded-2xl"
          aria-label="Timestamp note"
        />

        <IconButton
          aria-label="Add timestamp"
          title={canAddMarker ? "Add timestamp" : "Enter details"}
          disabled={!canAddMarker}
          size="md"
          iconSize="sm"
          variant="solid"
          onClick={addMarker}
        >
          <Plus />
        </IconButton>
      </div>
      {timeError && (
        <p id="tTime-error" className="mt-1 text-xs text-danger">
          Enter time as mm:ss
        </p>
      )}

      {sortedMarkers.length === 0 ? (
        <div className="mt-2 text-sm text-muted-foreground">No timestamps yet.</div>
      ) : (
        <ul className="mt-3 space-y-2">
          {sortedMarkers.map((m) => (
            <li
              key={m.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2"
            >
              {m.noteOnly ? (
                <span className="pill h-7 min-w-[60px] px-0 flex items-center justify-center">
                  <FileText size={14} className="opacity-80" />
                </span>
              ) : (
                <span className="pill h-7 min-w-[60px] px-3 text-[11px] font-mono tabular-nums text-center">
                  {m.time}
                </span>
              )}

              <span className="truncate text-sm">{m.note}</span>
              <IconButton
                aria-label="Delete timestamp"
                title="Delete timestamp"
                size="sm"
                iconSize="sm"
                variant="ring"
                onClick={() => removeMarker(m.id)}
              >
                <Trash2 />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
