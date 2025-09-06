// src/components/planner/WeekNotes.tsx
"use client";
import "./style.css";

/**
 * WeekNotes — uses the same day.notes as a longer textarea for the focused ISO date.
 * Yes, “WeekNotes” name is historical; this edits the current day to keep things simple.
 */

import * as React from "react";
import SectionCard from "@/components/ui/layout/SectionCard";
import Textarea from "@/components/ui/primitives/Textarea";
import { usePlanner, type ISODate } from "./usePlanner";

type Props = { iso: ISODate };

export default function WeekNotes({ iso }: Props) {
  const { focus, setFocus, day, setNotes } = usePlanner();
  const [value, setValue] = React.useState(day.notes ?? "");

  React.useEffect(() => {
    if (focus !== iso) setFocus(iso);
  }, [focus, iso, setFocus]);

  React.useEffect(() => {
    setValue(day.notes ?? "");
  }, [day.notes]);

  return (
    <SectionCard className="card-neo-soft">
      <SectionCard.Header title="Notes" />
      <SectionCard.Body>
        <Textarea
          placeholder="Jot down anything related to this day…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          name={`notes-${iso}`}
          className="planner-textarea"
          onBlur={() => setNotes(value)}
        />
        <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Autosaves on blur.</p>
      </SectionCard.Body>
    </SectionCard>
  );
}
