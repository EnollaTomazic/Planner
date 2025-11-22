"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { Card, cardSurfaceClassName } from "@/components/ui";
import { PersonaCard } from "./PersonaCard";
import { SavedPromptList } from "./SavedPromptList";
import {
  PromptForm,
  type PromptFormHandle,
  type PromptFormOption,
  type PromptFormValues,
} from "./PromptForm";
import type { Persona, PromptWithTitle } from "./types";

const PROMPT_CATEGORY_OPTIONS = [
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Codex review", label: "Codex review" },
  { value: "Notes", label: "Notes" },
] satisfies ReadonlyArray<PromptFormOption>;

export interface ChatPromptsTabHandle {
  focusCompose: (options?: FocusOptions) => void;
  focusPersonas: (options?: FocusOptions) => void;
}

interface ChatPromptsTabProps {
  prompts: PromptWithTitle[];
  query: string;
  personas: Persona[];
  savePrompt: (title: string, text: string, category: string) => boolean;
  updatePrompt: (
    id: string,
    title: string,
    text: string,
    category: string,
  ) => boolean;
  deletePrompt: (id: string) => boolean;
}

const createChatComposeDefaults = (): PromptFormValues => ({
  title: "",
  prompt: "",
  category: "ChatGPT",
});

export const ChatPromptsTab = React.forwardRef<
  ChatPromptsTabHandle,
  ChatPromptsTabProps
>(function ChatPromptsTab(
  { prompts, query, personas, savePrompt, updatePrompt, deletePrompt },
  ref,
) {
  const composeHeadingId = React.useId();
  const personasHeadingId = React.useId();
  const libraryHeadingId = React.useId();
  const formId = React.useId();
  const [composeValues, setComposeValues] = React.useState<PromptFormValues>(
    createChatComposeDefaults,
  );
  const composeValuesRef = React.useRef(composeValues);
  React.useEffect(() => {
    composeValuesRef.current = composeValues;
  }, [composeValues]);
  const [editingPromptId, setEditingPromptId] = React.useState<string | null>(
    null,
  );
  const composeFormRef = React.useRef<PromptFormHandle | null>(null);
  const personasHeadingRef = React.useRef<HTMLHeadingElement | null>(null);

  const resetComposeValues = React.useCallback(() => {
    const nextState = createChatComposeDefaults();
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

      const category = values.category ?? "ChatGPT";
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
    const nextCategory = values.category ?? "ChatGPT";

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
        category: prompt.category ?? "ChatGPT",
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
      focusPersonas: () => {
        personasHeadingRef.current?.focus();
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
            Compose prompt
          </h3>
          <p className="text-ui text-muted-foreground">
            Draft a ChatGPT request and save it for future reuse.
          </p>
        </div>
        <Card depth="raised" glitch className={cardSurfaceClassName}>
          <PromptForm
            id={`chat-prompts-form-${formId}`}
            ref={composeFormRef}
            title="New ChatGPT prompt"
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
        aria-labelledby={personasHeadingId}
        className="flex flex-col gap-[var(--space-3)]"
      >
        <div className="space-y-[var(--space-1)]">
          <h3
            id={personasHeadingId}
            ref={personasHeadingRef}
            className="type-title"
            tabIndex={-1}
          >
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
                <PersonaCard persona={persona} />
              </li>
            ))}
          </ul>
        ) : (
          <PersonaEmptyStateCard />
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
});

ChatPromptsTab.displayName = "ChatPromptsTab";

function PersonaEmptyStateCard() {
  return (
    <Card
      aria-live="polite"
      className="relative isolate flex items-start gap-[var(--space-3)] overflow-hidden border border-dashed border-border/70 bg-card/70 p-[var(--space-4)] shadow-neo-soft before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-accent/5"
    >
      <div className="flex items-center justify-center rounded-full bg-card/80 p-[var(--space-3)] ring-1 ring-inset ring-border/50">
        <Sparkles aria-hidden className="size-[var(--space-6)] text-primary" />
      </div>
      <div className="space-y-[var(--space-2)]">
        <div className="space-y-[var(--space-1)]">
          <p className="text-body font-semibold text-card-foreground">
            Start your first persona
          </p>
          <p className="text-ui text-muted-foreground">
            Capture tone-setting instructions you want to reuse at the start of chats.
          </p>
        </div>
        <ul className="list-inside list-disc space-y-[var(--space-1)] text-ui text-muted-foreground">
          <li>Name the persona and give a short description.</li>
          <li>Save the prompt text you want to drop into new conversations.</li>
        </ul>
      </div>
    </Card>
  );
}
