"use client";

import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { useFieldIds } from "@/lib/useFieldIds";
import { Check as CheckIcon } from "lucide-react";

interface PromptsComposePanelProps {
  title: string;
  onTitleChange: (value: string) => void;
  text: string;
  onTextChange: (value: string) => void;
  onSave: () => void;
}

export function PromptsComposePanel({
  title,
  onTitleChange,
  text,
  onTextChange,
  onSave,
}: PromptsComposePanelProps) {
  const titleField = useFieldIds();
  const textField = useFieldIds();
  const titleHelpId = `${titleField.id}-help`;
  const canSave = title.trim().length > 0 && text.trim().length > 0;

  return (
    <Card className="shadow-inner-md">
      <div className="space-y-[var(--space-3)] p-[var(--space-4)]">
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
      <div className="flex justify-end border-t border-border/60 bg-surface-low px-[var(--space-4)] py-[var(--space-3)]">
        <Button type="button" onClick={onSave} disabled={!canSave}>
          Save
        </Button>
      </div>
    </Card>
  );
}
