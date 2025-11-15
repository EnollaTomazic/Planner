"use client";

import * as React from "react";

import { Label, Textarea } from "@/components/ui";

export interface NotesTabHandle {
  focusScratchpad: (options?: FocusOptions) => void;
}

export interface NotesTabProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesTab = React.forwardRef<NotesTabHandle, NotesTabProps>(
  ({ value, onChange }, ref) => {
    const notesId = React.useId();
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(
      ref,
      () => ({
        focusScratchpad: (options) => {
          textareaRef.current?.focus(options);
        },
      }),
      [],
    );

    return (
      <div className="w-full max-w-[calc(var(--space-8)*12)] space-y-[var(--space-3)]">
        <div className="space-y-[var(--space-2)]">
          <Label htmlFor={notesId}>Scratchpad</Label>
          <Textarea
            id={notesId}
            ref={textareaRef}
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
  },
);

NotesTab.displayName = "NotesTab";
