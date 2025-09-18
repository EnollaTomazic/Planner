"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Textarea, Label } from "@/components/ui";
import { usePersistentState } from "@/lib/db";
import useDebouncedCallback from "@/lib/useDebouncedCallback";

export default function PromptsNotesPanel() {
  const [notes, setNotes] = usePersistentState<string>("prompts.notes.v1", "");
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = React.useState<number | null>(null);
  const firstRenderRef = React.useRef(true);
  const notesId = React.useId();

  const [scheduleSaved, cancelScheduled] = useDebouncedCallback(() => {
    setStatus("saved");
    setLastSaved(Date.now());
  }, 600);

  React.useEffect(() => cancelScheduled, [cancelScheduled]);

  React.useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      if (notes.trim().length > 0) {
        setStatus("saved");
        setLastSaved(Date.now());
      }
      return;
    }
    setStatus("saving");
    scheduleSaved();
  }, [notes, scheduleSaved]);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (event) => {
      setNotes(event.target.value);
    },
    [setNotes],
  );

  const statusLabel = React.useMemo(() => {
    if (status === "saving") return "Saving…";
    if (status === "saved" && lastSaved) {
      const time = new Date(lastSaved).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Autosaved ${time}`;
    }
    return "Autosave keeps these notes ready when you return.";
  }, [lastSaved, status]);

  return (
    <Card className="space-y-[var(--space-4)]">
      <CardHeader>
        <CardTitle>Notebook</CardTitle>
        <CardDescription>
          Keep research, draft ideas, or review prep in a scratchpad that persists across sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[var(--space-3)]">
        <div className="space-y-[var(--space-2)]">
          <Label htmlFor={notesId}>Notes</Label>
          <Textarea
            id={notesId}
            value={notes}
            onChange={handleChange}
            placeholder="Capture reactions, follow-ups, or context you don’t want to lose."
            resize="resize-y"
            rows={8}
          />
        </div>
        <p className="text-label text-muted-foreground" aria-live="polite">
          {statusLabel}
        </p>
      </CardContent>
    </Card>
  );
}
