import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import ReviewSurface from "@/components/reviews/ReviewSurface";

export type ReviewSummaryNotesProps = {
  notes: string;
};

export default function ReviewSummaryNotes({ notes }: ReviewSummaryNotesProps) {
  return (
    <div>
      <SectionLabel>Notes</SectionLabel>
      <ReviewSurface
        padding="sm"
        className="text-ui leading-6 text-foreground/70"
      >
        {notes}
      </ReviewSurface>
    </div>
  );
}
