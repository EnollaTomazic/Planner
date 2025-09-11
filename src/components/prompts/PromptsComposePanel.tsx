"use client";

import * as React from "react";
import { Input, Textarea } from "@/components/ui";
import IconButton from "@/components/ui/primitives/IconButton";
import { Check as CheckIcon } from "lucide-react";

interface PromptsComposePanelProps {
  title: string;
  onTitleChange: (value: string) => void;
  text: string;
  onTextChange: (value: string) => void;
}

export default function PromptsComposePanel({
  title,
  onTitleChange,
  text,
  onTextChange,
}: PromptsComposePanelProps) {
  const titleId = React.useId();
  return (
    <div className="space-y-3">
      <Input
        id={titleId}
        placeholder="Title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        aria-describedby={`${titleId}-help`}
      >
        <IconButton
          size="sm"
          aria-label="Confirm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <CheckIcon aria-hidden />
        </IconButton>
      </Input>
      <p id={`${titleId}-help`} className="mt-1 text-xs text-muted-foreground">
        Add a short title
      </p>
      <Textarea
        placeholder="Write your prompt or snippet…"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        resize="resize-y"
      />
    </div>
  );
}
