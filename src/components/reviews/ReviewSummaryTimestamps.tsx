import * as React from "react";
import type { ReviewMarker } from "@/lib/types";
import NeonIcon from "@/components/reviews/NeonIcon";
import ReviewSurface from "./ReviewSurface";
import { FileText } from "lucide-react";

export type ReviewSummaryTimestampsProps = {
  markers: ReviewMarker[];
};

export default function ReviewSummaryTimestamps({
  markers,
}: ReviewSummaryTimestampsProps) {
  const hasAny = markers.length > 0;
  const hasTimed = hasAny && markers.some((m) => !m.noteOnly);
  const hasNoteOnly = hasAny && markers.every((m) => m.noteOnly);

  return (
    <div>
      <div className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)]" aria-label="Timestamps">
        <NeonIcon kind="clock" on={!!hasTimed} size="xl" staticGlow />
        <NeonIcon kind="file" on={!!hasNoteOnly} size="xl" staticGlow />
        <div className="h-[var(--hairline-w)] flex-1 bg-gradient-to-r from-foreground/20 via-foreground/5 to-transparent" />
      </div>
      {!markers.length ? (
        <div className="text-ui text-muted-foreground">No timestamps yet.</div>
      ) : (
        <ul className="space-y-[var(--space-2)]">
          {[...markers]
            .sort((a, b) => a.seconds - b.seconds)
            .map((m) => (
              <ReviewSurface
                as="li"
                key={m.id}
                padding="sm"
                className="grid grid-cols-[auto_1fr] items-center gap-[var(--space-2)]"
              >
                {m.noteOnly ? (
                  <span
                    className="pill flex h-[var(--space-6)] w-[calc(var(--space-6)+var(--space-2))] items-center justify-center px-0"
                    title="Note"
                    aria-label="Note"
                  >
                    <FileText aria-hidden className="icon-xs opacity-80" />
                  </span>
                ) : (
                  <span className="pill h-[var(--space-6)] px-[var(--space-3)] text-ui font-mono tabular-nums leading-none">
                    {m.time ?? "00:00"}
                  </span>
                )}
                <span className="truncate text-ui">{m.note || "—"}</span>
              </ReviewSurface>
            ))}
        </ul>
      )}
    </div>
  );
}
