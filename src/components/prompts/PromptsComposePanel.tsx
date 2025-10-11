"use client";

import * as React from "react";
import { Input, Textarea, Label } from "@/components/ui";
import { Check as CheckIcon } from "lucide-react";

interface PromptsComposePanelProps {
  title: string;
  onTitleChange: (value: string) => void;
  text: string;
  onTextChange: (value: string) => void;
}

export function PromptsComposePanel({
  title,
  onTitleChange,
  text,
  onTextChange,
}: PromptsComposePanelProps) {
  const titleId = React.useId();
  const textId = React.useId();
  return (
    <div className="space-y-[var(--space-3)]">
      <div>
        <Label htmlFor={titleId}>Title</Label>
        <Input
          id={titleId}
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-describedby={`${titleId}-help`}
        >
          <CheckIcon
            aria-hidden="true"
            className="absolute right-[var(--space-2)] top-1/2 -translate-y-1/2"
          />
        </Input>
        <p
          id={`${titleId}-help`}
          className="mt-[var(--space-1)] text-label text-muted-foreground"
        >
          Add a short title
        </p>
      </div>
      <div>
        <Label htmlFor={textId}>Prompt</Label>
        <Textarea
          id={textId}
          placeholder="Write your prompt or snippet…"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          resize="resize-y"
        />
      </div>
    </div>
  );
}
