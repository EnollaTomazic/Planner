"use client";

import * as React from "react";

import { Card } from "@/components/ui";
import {
  EntityForm,
  type EntityFormValues,
} from "@/components/forms/EntityForm";

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
  const formId = React.useId();

  const handleSubmit = React.useCallback(() => {
    onSave();
    return false;
  }, [onSave]);

  const handleValuesChange = React.useCallback(
    (values: EntityFormValues) => {
      onTitleChange(values.title ?? "");
      onTextChange(values.prompt ?? "");
    },
    [onTextChange, onTitleChange],
  );

  const trimmedTitle = title.trim();
  const trimmedText = text.trim();
  const submitDisabled = trimmedTitle.length === 0 || trimmedText.length === 0;

  return (
    <Card className="shadow-inner-md">
      <EntityForm
        id={`prompts-compose-${formId}`}
        initialValues={{ title, prompt: text }}
        fields={[
          {
            id: "title",
            label: "Title",
            placeholder: "Title",
            required: true,
          },
          {
            id: "prompt",
            label: "Prompt",
            placeholder: "Write your prompt or snippet…",
            type: "textarea",
            rows: 6,
            required: true,
          },
        ]}
        submitLabel="Save"
        submitDisabled={submitDisabled}
        onSubmit={handleSubmit}
        onValuesChange={handleValuesChange}
        resetOnSubmit={false}
      />
    </Card>
  );
}
