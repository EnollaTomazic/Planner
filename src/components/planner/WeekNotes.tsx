// src/components/planner/WeekNotes.tsx
"use client";
import "./style.css";

/**
 * WeekNotes — uses the same day.notes as a longer textarea for the focused ISO date.
 * Yes, “WeekNotes” name is historical; this edits the current day to keep things simple.
 */

import * as React from "react";
import Textarea from "@/components/ui/primitives/textarea";
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
    <section className="rounded-2xl border p-4 space-y-2">
      <h2 className="text-base font-semibold">Notes</h2>
      <Textarea
        placeholder="Jot anything for this day…"
        value={value}
        onChange={e => setValue(e.target.value)}
        name={`notes-${iso}`}
        className="min-h-[80px] rounded-lg border p-2 text-sm"
        onBlur={() => setNotes(value)}
      />
      <p className="text-xs text-muted-foreground">Autosaves on blur</p>
    </section>
  );
}
