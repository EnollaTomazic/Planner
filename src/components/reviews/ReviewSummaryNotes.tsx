import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";

export type ReviewSummaryNotesProps = {
  notes: string;
};

export default function ReviewSummaryNotes({ notes }: ReviewSummaryNotesProps) {
  return (
    <div>
      <SectionLabel>Notes</SectionLabel>
      <div className="rounded-2xl border border-border bg-card p-3 text-sm leading-6 text-foreground/70">
        {notes}
      </div>
    </div>
  );
}

