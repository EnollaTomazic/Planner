"use client";

import * as React from "react";

import { GlitchNeoCard } from "@/components/ui";
import {
  EntityForm,
  type EntityFormOption,
  type EntityFormValues,
} from "@/components/forms/EntityForm";
import { PromptList } from "./PromptList";
import type { PromptWithTitle } from "./types";

const PROMPT_CATEGORY_OPTIONS = [
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Codex review", label: "Codex review" },
  { value: "Notes", label: "Notes" },
] satisfies ReadonlyArray<EntityFormOption>;

interface CodexPromptsTabProps {
  prompts: PromptWithTitle[];
  query: string;
  savePrompt: (title: string, text: string, category: string) => boolean;
}

export function CodexPromptsTab({
  prompts,
  query,
  savePrompt,
}: CodexPromptsTabProps) {
  const composeHeadingId = React.useId();
  const libraryHeadingId = React.useId();
  const formId = React.useId();

  const handleSave = React.useCallback(
    (values: EntityFormValues) => {
      const title = values.title?.trim() ?? "";
      const prompt = values.prompt?.trim() ?? "";
      if (!title || !prompt) {
        return false;
      }

      const category = values.category ?? "Codex review";
      return savePrompt(title, prompt, category);
    },
    [savePrompt],
  );

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <section
        aria-labelledby={composeHeadingId}
        className="flex flex-col gap-[var(--space-3)]"
      >
        <div className="space-y-[var(--space-1)]">
          <h3 id={composeHeadingId} className="type-title">
            Review checklist
          </h3>
          <p className="text-ui text-muted-foreground">
            Capture Codex review prompts that help validate architecture,
            testing, and release notes.
          </p>
        </div>
        <GlitchNeoCard className="p-[var(--space-4)]">
          <EntityForm
            id={`codex-prompts-form-${formId}`}
            title="New Codex prompt"
            fields={[
              {
                id: "title",
                label: "Title",
                placeholder: "Audit deployment plan",
                required: true,
              },
              {
                id: "category",
                label: "Category",
                type: "select",
                options: PROMPT_CATEGORY_OPTIONS,
                defaultValue: "Codex review",
              },
              {
                id: "prompt",
                label: "Prompt",
                placeholder: "Outline review checklist…",
                type: "textarea",
                rows: 6,
                required: true,
              },
            ]}
            initialValues={{ category: "Codex review" }}
            submitLabel="Save"
            onSubmit={handleSave}
          />
        </GlitchNeoCard>
      </section>

      <section
        aria-labelledby={libraryHeadingId}
        className="flex flex-col gap-[var(--space-3)]"
      >
        <div className="space-y-[var(--space-1)]">
          <h3 id={libraryHeadingId} className="type-title">
            Codex prompts
          </h3>
          <p className="text-ui text-muted-foreground">
            Saved checklists appear here for quick reuse during reviews.
          </p>
        </div>
        <PromptList prompts={prompts} query={query} />
      </section>
    </div>
  );
}
