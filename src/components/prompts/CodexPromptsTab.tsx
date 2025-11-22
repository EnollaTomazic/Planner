"use client";

import * as React from "react";

import { Card, cardSurfaceClassName } from "@/components/ui";
import { SavedPromptList } from "./SavedPromptList";
import {
  PromptForm,
  type PromptFormHandle,
  type PromptFormOption,
  type PromptFormValues,
} from "./PromptForm";
import type { PromptWithTitle } from "./types";

const PROMPT_CATEGORY_OPTIONS = [
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Codex review", label: "Codex review" },
  { value: "Notes", label: "Notes" },
] satisfies ReadonlyArray<PromptFormOption>;

export interface CodexPromptsTabHandle {
  focusCompose: (options?: FocusOptions) => void;
}

export interface CodexPromptsTabProps {
  prompts: PromptWithTitle[];
  query: string;
  savePrompt: (title: string, text: string, category: string) => boolean;
  updatePrompt: (
    id: string,
    title: string,
    text: string,
    category: string,
  ) => boolean;
  deletePrompt: (id: string) => boolean;
}

const createCodexComposeDefaults = (): PromptFormValues => ({
  title: "",
  prompt: "",
  category: "Codex review",
});

export const CodexPromptsTab = React.forwardRef<
  CodexPromptsTabHandle,
  CodexPromptsTabProps
>(function CodexPromptsTab(
  { prompts, query, savePrompt, updatePrompt, deletePrompt },
  ref,
) {
  const composeHeadingId = React.useId();
  const libraryHeadingId = React.useId();
  const formId = React.useId();
  const [composeValues, setComposeValues] = React.useState<PromptFormValues>(
    createCodexComposeDefaults,
  );
  const composeValuesRef = React.useRef(composeValues);
  React.useEffect(() => {
    composeValuesRef.current = composeValues;
  }, [composeValues]);
  const [editingPromptId, setEditingPromptId] = React.useState<string | null>(
    null,
  );
  const composeFormRef = React.useRef<PromptFormHandle | null>(null);

  const resetComposeValues = React.useCallback(() => {
    const nextState = createCodexComposeDefaults();
    composeValuesRef.current = nextState;
    setComposeValues(nextState);
    setEditingPromptId(null);
  }, []);

  const handleSave = React.useCallback(
    (values: PromptFormValues) => {
      const title = values.title?.trim() ?? "";
      const prompt = values.prompt?.trim() ?? "";
      if (!title || !prompt) {
        return false;
      }

      const category = values.category ?? "Codex review";
      if (editingPromptId) {
        const success = updatePrompt(editingPromptId, title, prompt, category);
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

  const handleValuesChange = React.useCallback((values: PromptFormValues) => {
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
        prompt: prompt.text,
        category: prompt.category ?? "Codex review",
      } satisfies PromptFormValues;
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

  React.useImperativeHandle(
    ref,
    () => ({
      focusCompose: (options) => {
        composeFormRef.current?.focus(options);
      },
    }),
    [],
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
        <Card depth="raised" glitch className={cardSurfaceClassName}>
          <PromptForm
            id={`codex-prompts-form-${formId}`}
            ref={composeFormRef}
            title="New Codex prompt"
            submitLabel={submitLabel}
            submitDisabled={submitDisabled}
            values={composeValues}
            categories={PROMPT_CATEGORY_OPTIONS}
            onSubmit={handleSave}
            onChange={handleValuesChange}
          />
        </Card>
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
});

CodexPromptsTab.displayName = "CodexPromptsTab";
