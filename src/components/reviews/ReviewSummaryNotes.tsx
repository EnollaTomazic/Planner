import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";

export type ReviewSummaryNotesProps = {
  notes: string;
};

export default function ReviewSummaryNotes({ notes }: ReviewSummaryNotesProps) {
  return (
    <div>
      <SectionLabel>Notes</SectionLabel>
      <div className="rounded-card r-card-lg border border-border bg-card p-3 text-ui leading-6 text-foreground/70">
        {notes}
      </div>
    </div>
  );
}
