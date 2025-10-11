import * as React from "react";
import { SectionLabel } from "@/components/reviews/SectionLabel";
import { ReviewSurface } from "./ReviewSurface";

export type ReviewSummaryNotesProps = {
  notes: string;
};

export function ReviewSummaryNotes({ notes }: ReviewSummaryNotesProps) {
  return (
    <div>
      <SectionLabel>Notes</SectionLabel>
      <ReviewSurface padding="md" tone="muted">
        <div className="text-ui leading-6 text-foreground/70">{notes}</div>
      </ReviewSurface>
    </div>
  );
}
