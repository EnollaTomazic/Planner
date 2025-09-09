import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";

export type ReviewSummaryNotesProps = {
  notes: string;
};

export default function ReviewSummaryNotes({ notes }: ReviewSummaryNotesProps) {
  return (
    <div>
      <SectionLabel>Notes</SectionLabel>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm leading-6 text-[hsl(var(--foreground)/0.7)]">
        {notes}
      </div>
    </div>
  );
}

