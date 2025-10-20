"use client";

import { Input, Textarea, Label } from "@/components/ui";
import { useFieldIds } from "@/lib/useFieldIds";
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
  const titleField = useFieldIds();
  const textField = useFieldIds();
  const titleHelpId = `${titleField.id}-help`;
  return (
    <div className="space-y-[var(--space-3)]">
      <div>
        <Label htmlFor={titleField.id}>Title</Label>
        <Input
          id={titleField.id}
          name={titleField.name}
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-describedby={titleHelpId}
        >
          <CheckIcon
            aria-hidden="true"
            className="absolute right-[var(--space-2)] top-1/2 -translate-y-1/2"
          />
        </Input>
        <p
          id={titleHelpId}
          className="mt-[var(--space-1)] text-label text-muted-foreground"
        >
          Add a short title
        </p>
      </div>
      <div>
        <Label htmlFor={textField.id}>Prompt</Label>
        <Textarea
          id={textField.id}
          name={textField.name}
          placeholder="Write your prompt or snippet…"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          resize="resize-y"
        />
      </div>
    </div>
  );
}
