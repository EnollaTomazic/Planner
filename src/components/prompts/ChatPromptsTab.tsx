"use client";

import * as React from "react";

import { Card, GlitchNeoCard } from "@/components/ui";
import {
  PromptForm,
  type PromptCategoryOption,
  type PromptFormValues,
} from "./PromptForm";
import { SavedPromptList } from "./SavedPromptList";
import type { Persona, PromptWithTitle } from "./types";
import { LOCALE } from "@/lib/utils";

const PROMPT_CATEGORY_OPTIONS = [
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Codex review", label: "Codex review" },
  { value: "Notes", label: "Notes" },
] satisfies ReadonlyArray<PromptCategoryOption>;

interface ChatPromptsTabProps {
  prompts: PromptWithTitle[];
  query: string;
  personas: Persona[];
  savePrompt: (title: string, text: string, category: string) => boolean;
  updatePrompt: (id: string, title: string, text: string) => boolean;
  deletePrompt: (id: string) => boolean;
}

const createChatComposeDefaults = (): PromptFormValues => ({
  title: "",
  body: "",
  category: "ChatGPT",
});

export function ChatPromptsTab({
  prompts,
  query,
  personas,
  savePrompt,
  updatePrompt,
  deletePrompt,
}: ChatPromptsTabProps) {
  const composeHeadingId = React.useId();
  const personasHeadingId = React.useId();
  const libraryHeadingId = React.useId();
  const formId = React.useId();
  const [composeValues, setComposeValues] = React.useState<PromptFormValues>(
    createChatComposeDefaults,
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
    const nextState = createChatComposeDefaults();
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

      const category = values.category || "ChatGPT";
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
    const nextCategory = values.category ?? "ChatGPT";

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

    composeValuesRef.current = nextState;
    setComposeValues(nextState);
  }, []);

  const handleEditPrompt = React.useCallback(
    (prompt: PromptWithTitle) => {
      const nextState = {
        title: prompt.title,
        body: prompt.text,
        category: composeValuesRef.current.category ?? "ChatGPT",
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
            Compose prompt
          </h3>
          <p className="text-ui text-muted-foreground">
            Draft a ChatGPT request and save it for future reuse.
          </p>
        </div>
        <GlitchNeoCard className="p-[var(--space-4)]">
          <PromptForm
            id={`chat-prompts-form-${formId}`}
            heading="New ChatGPT prompt"
            values={composeValues}
            defaultCategory="ChatGPT"
            categoryOptions={PROMPT_CATEGORY_OPTIONS}
            submitLabel={submitLabel}
            onSubmit={handleSave}
            onValuesChange={handleValuesChange}
            titlePlaceholder="Review macro calls"
            bodyPlaceholder="Write your prompt or snippet…"
            resetSignal={formResetToken}
          />
        </GlitchNeoCard>
      </section>

      <section
        aria-labelledby={personasHeadingId}
        className="flex flex-col gap-[var(--space-3)]"
      >
        <div className="space-y-[var(--space-1)]">
          <h3 id={personasHeadingId} className="type-title">
            Personas
          </h3>
          <p className="text-ui text-muted-foreground">
            Keep tailored introductions to quickly set tone and context.
          </p>
        </div>
        {personas.length > 0 ? (
          <ul className="grid gap-[var(--space-3)] md:grid-cols-2">
            {personas.map((persona) => (
              <li key={persona.id}>
                <Card className="flex h-full flex-col gap-[var(--space-3)] p-[var(--space-4)]">
                  <header className="space-y-[var(--space-1)]">
                    <h4 className="font-semibold text-body">{persona.name}</h4>
                    {persona.description ? (
                      <p className="text-ui text-muted-foreground">
                        {persona.description}
                      </p>
                    ) : null}
                    <time
                      dateTime={new Date(persona.createdAt).toISOString()}
                      className="block text-label text-muted-foreground"
                    >
                      Added {new Date(persona.createdAt).toLocaleString(LOCALE)}
                    </time>
                  </header>
                  <p className="whitespace-pre-wrap rounded-[var(--radius-md)] bg-card/60 p-[var(--space-3)] text-ui">
                    {persona.prompt}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ui text-muted-foreground">
            No personas yet. Start a collection to keep favorite tones handy.
          </p>
        )}
      </section>

      <section
        aria-labelledby={libraryHeadingId}
        className="flex flex-col gap-[var(--space-3)]"
      >
        <div className="space-y-[var(--space-1)]">
          <h3 id={libraryHeadingId} className="type-title">
            Reusable prompts
          </h3>
          <p className="text-ui text-muted-foreground">
            Saved ChatGPT prompts appear here with newest first.
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
