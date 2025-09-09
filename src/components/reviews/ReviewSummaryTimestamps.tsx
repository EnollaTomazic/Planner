import * as React from "react";
import type { ReviewMarker } from "@/lib/types";
import NeonIcon from "@/components/reviews/NeonIcon";
import { FileText } from "lucide-react";

export type ReviewSummaryTimestampsProps = {
  markers: ReviewMarker[];
};

export default function ReviewSummaryTimestamps({ markers }: ReviewSummaryTimestampsProps) {
  const hasAny = markers.length > 0;
  const hasTimed = hasAny && markers.some((m) => !m.noteOnly);
  const hasNoteOnly = hasAny && markers.every((m) => m.noteOnly);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2" aria-label="Timestamps">
        <NeonIcon kind="clock" on={!!hasTimed} size={32} staticGlow />
        <NeonIcon kind="file" on={!!hasNoteOnly} size={32} staticGlow />
        <div className="h-px flex-1 bg-gradient-to-r from-foreground/20 via-foreground/5 to-transparent" />
      </div>
      {!markers.length ? (
        <div className="text-sm text-muted-foreground">No timestamps yet.</div>
      ) : (
        <ul className="space-y-2">
          {[...markers]
            .sort((a, b) => a.seconds - b.seconds)
            .map((m) => (
              <li
                key={m.id}
                className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2"
              >
                {m.noteOnly ? (
                  <span className="pill flex h-7 w-14 items-center justify-center px-0" title="Note" aria-label="Note">
                    <FileText size={14} className="opacity-80" />
                  </span>
                ) : (
                  <span className="pill h-7 px-3 text-[11px] font-mono tabular-nums leading-none">{m.time ?? "00:00"}</span>
                )}
                <span className="truncate text-sm">{m.note || "—"}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

