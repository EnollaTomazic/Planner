"use client";

import * as React from "react";

import { GlitchNeoCard } from "@/components/ui";
import {
  PromptForm,
  type PromptCategoryOption,
  type PromptFormValues,
} from "./PromptForm";
import { SavedPromptList } from "./SavedPromptList";
import type { PromptWithTitle } from "./types";

const PROMPT_CATEGORY_OPTIONS = [
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Codex review", label: "Codex review" },
  { value: "Notes", label: "Notes" },
] satisfies ReadonlyArray<PromptCategoryOption>;

interface CodexPromptsTabProps {
  prompts: PromptWithTitle[];
  query: string;
  savePrompt: (title: string, text: string, category: string) => boolean;
  updatePrompt: (id: string, title: string, text: string) => boolean;
  deletePrompt: (id: string) => boolean;
}

const createCodexComposeDefaults = (): PromptFormValues => ({
  title: "",
  body: "",
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
  const [composeValues, setComposeValues] = React.useState<PromptFormValues>(
    createCodexComposeDefaults,
  );
  const [formResetToken, setFormResetToken] = React.useState(0);
  const composeValuesRef = React.useRef<PromptFormValues>(composeValues);
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
    setFormResetToken((token) => token + 1);
  }, []);

  const handleSave = React.useCallback(
    (values: PromptFormValues) => {
      const title = values.title.trim();
      const body = values.body.trim();
      if (!title || !body) {
        return false;
      }

      const category = values.category || "Codex review";
      if (editingPromptId) {
        const success = updatePrompt(editingPromptId, title, body);
        if (success) {
          resetComposeValues();
        }
        return success;
      }
      const success = savePrompt(title, body, category);
      if (success) {
        resetComposeValues();
      }
      return success;
    },
    [editingPromptId, resetComposeValues, savePrompt, updatePrompt],
  );

  const handleValuesChange = React.useCallback((values: PromptFormValues) => {
    const nextTitle = values.title ?? "";
    const nextBody = values.body ?? "";
    const nextCategory = values.category ?? "Codex review";

    const previous = composeValuesRef.current;
    if (
      previous.title === nextTitle &&
      previous.body === nextBody &&
      previous.category === nextCategory
    ) {
      return;
    }

    const nextState = {
      title: nextTitle,
      body: nextBody,
      category: nextCategory,
    } satisfies PromptFormValues;

    React.startTransition(() => {
      composeValuesRef.current = nextState;
      setComposeValues(nextState);
    });
  }, []);

  const handleEditPrompt = React.useCallback(
    (prompt: PromptWithTitle) => {
      const nextState = {
        title: prompt.title,
        body: prompt.text,
        category: composeValuesRef.current.category ?? "Codex review",
      } satisfies PromptFormValues;
      composeValuesRef.current = nextState;
      setComposeValues(nextState);
      setEditingPromptId(prompt.id);
      setFormResetToken((token) => token + 1);
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
          <PromptForm
            id={`codex-prompts-form-${formId}`}
            heading="New Codex prompt"
            values={composeValues}
            defaultCategory="Codex review"
            categoryOptions={PROMPT_CATEGORY_OPTIONS}
            submitLabel={submitLabel}
            onSubmit={handleSave}
            onValuesChange={handleValuesChange}
            titlePlaceholder="Audit deployment plan"
            bodyPlaceholder="Outline review checklist…"
            resetSignal={formResetToken}
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
