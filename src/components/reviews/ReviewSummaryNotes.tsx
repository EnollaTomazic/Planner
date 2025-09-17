import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import SectionCard from "@/components/ui/layout/SectionCard";

export type ReviewSummaryNotesProps = {
  notes: string;
};

export default function ReviewSummaryNotes({ notes }: ReviewSummaryNotesProps) {
  return (
    <div>
      <SectionLabel>Notes</SectionLabel>
      <SectionCard.Body className="text-ui leading-6 text-foreground/70">
        {notes}
      </SectionCard.Body>
    </div>
  );
}
