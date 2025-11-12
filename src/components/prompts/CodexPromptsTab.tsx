"use client";

import * as React from "react";

import { GlitchNeoCard } from "@/components/ui";
import {
  EntityForm,
  type EntityFormOption,
  type EntityFormValues,
} from "@/components/forms/EntityForm";
import { SavedPromptList } from "./SavedPromptList";
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
  updatePrompt: (id: string, title: string, text: string) => boolean;
  deletePrompt: (id: string) => boolean;
}

const createCodexComposeDefaults = (): EntityFormValues => ({
  title: "",
  prompt: "",
  category: "Codex review",
});

export function CodexPromptsTab({
  prompts,
  query,
  savePrompt,
  updatePrompt,
  deletePrompt,
}: CodexPromptsTabProps) {
  const composeHeadingId = React.useId();
  const libraryHeadingId = React.useId();
  const formId = React.useId();
  const [composeValues, setComposeValues] = React.useState<EntityFormValues>(
    createCodexComposeDefaults,
  );
  const composeValuesRef = React.useRef(composeValues);
  React.useEffect(() => {
    composeValuesRef.current = composeValues;
  }, [composeValues]);
  const [editingPromptId, setEditingPromptId] = React.useState<string | null>(
    null,
  );

  const resetComposeValues = React.useCallback(() => {
    const nextState = createCodexComposeDefaults();
    composeValuesRef.current = nextState;
    setComposeValues(nextState);
    setEditingPromptId(null);
  }, []);

  const handleSave = React.useCallback(
    (values: EntityFormValues) => {
      const title = values.title?.trim() ?? "";
      const prompt = values.prompt?.trim() ?? "";
      if (!title || !prompt) {
        return false;
      }

      const category = values.category ?? "Codex review";
      if (editingPromptId) {
        const success = updatePrompt(editingPromptId, title, prompt);
        if (success) {
          resetComposeValues();
        }
        return success;
      }
      const success = savePrompt(title, prompt, category);
      if (success) {
        resetComposeValues();
      }
      return success;
    },
    [editingPromptId, resetComposeValues, savePrompt, updatePrompt],
  );

  const handleValuesChange = React.useCallback((values: EntityFormValues) => {
    const nextTitle = values.title ?? "";
    const nextPrompt = values.prompt ?? "";
    const nextCategory = values.category ?? "Codex review";

    const previous = composeValuesRef.current;
    if (
      previous.title === nextTitle &&
      previous.prompt === nextPrompt &&
      previous.category === nextCategory
    ) {
      return;
    }

    const nextState = {
      title: nextTitle,
      prompt: nextPrompt,
      category: nextCategory,
    } satisfies EntityFormValues;

    React.startTransition(() => {
      composeValuesRef.current = nextState;
      setComposeValues(nextState);
    });
  }, []);

  const handleEditPrompt = React.useCallback(
    (prompt: PromptWithTitle) => {
      const nextState = {
        title: prompt.title,
        prompt: prompt.text,
        category: composeValuesRef.current.category ?? "Codex review",
      } satisfies EntityFormValues;
      composeValuesRef.current = nextState;
      setComposeValues(nextState);
      setEditingPromptId(prompt.id);
    },
    [],
  );

  const handleDeletePrompt = React.useCallback(
    (prompt: PromptWithTitle) => {
      const didDelete = deletePrompt(prompt.id);
      if (didDelete && editingPromptId === prompt.id) {
        resetComposeValues();
      }
    },
    [deletePrompt, editingPromptId, resetComposeValues],
  );

  const submitDisabled = React.useMemo(() => {
    const title = composeValues.title?.trim() ?? "";
    const prompt = composeValues.prompt?.trim() ?? "";
    return title.length === 0 || prompt.length === 0;
  }, [composeValues.prompt, composeValues.title]);

  const submitLabel = editingPromptId ? "Update" : "Save";

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
            initialValues={composeValues}
            submitLabel={submitLabel}
            submitDisabled={submitDisabled}
            onSubmit={handleSave}
            onValuesChange={handleValuesChange}
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
        <SavedPromptList
          prompts={prompts}
          query={query}
          onSelectPrompt={handleEditPrompt}
          onEditPrompt={handleEditPrompt}
          onDeletePrompt={handleDeletePrompt}
        />
      </section>
    </div>
  );
}
