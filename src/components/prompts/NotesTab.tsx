"use client";

import * as React from "react";

import { Label, Textarea } from "@/components/ui";

interface NotesTabProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesTab({ value, onChange }: NotesTabProps) {
  const notesId = React.useId();

  return (
    <div className="w-full max-w-[calc(var(--space-8)*12)] space-y-[var(--space-3)]">
      <div className="space-y-[var(--space-2)]">
        <Label htmlFor={notesId}>Scratchpad</Label>
        <Textarea
          id={notesId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Capture ideas, snippets, or follow-ups…"
          resize="resize-y"
          aria-describedby={`${notesId}-help`}
        />
        <p
          id={`${notesId}-help`}
          className="text-label text-muted-foreground"
        >
          Notes auto-save locally and sync across refreshes.
        </p>
      </div>
    </div>
  );
}
