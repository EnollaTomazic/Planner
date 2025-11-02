"use client";

import * as React from "react";

import { Card, GlitchNeoCard } from "@/components/ui";
import {
  EntityForm,
  type EntityFormOption,
  type EntityFormValues,
} from "@/components/forms/EntityForm";
import { PromptList } from "./PromptList";
import type { Persona, PromptWithTitle } from "./types";
import { LOCALE } from "@/lib/utils";

const PROMPT_CATEGORY_OPTIONS = [
  { value: "ChatGPT", label: "ChatGPT" },
  { value: "Codex review", label: "Codex review" },
  { value: "Notes", label: "Notes" },
] satisfies ReadonlyArray<EntityFormOption>;

interface ChatPromptsTabProps {
  prompts: PromptWithTitle[];
  query: string;
  personas: Persona[];
  savePrompt: (title: string, text: string, category: string) => boolean;
}

export function ChatPromptsTab({
  prompts,
  query,
  personas,
  savePrompt,
}: ChatPromptsTabProps) {
  const composeHeadingId = React.useId();
  const personasHeadingId = React.useId();
  const libraryHeadingId = React.useId();
  const formId = React.useId();

  const handleSave = React.useCallback(
    (values: EntityFormValues) => {
      const title = values.title?.trim() ?? "";
      const prompt = values.prompt?.trim() ?? "";
      if (!title || !prompt) {
        return false;
      }

      const category = values.category ?? "ChatGPT";
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
            Compose prompt
          </h3>
          <p className="text-ui text-muted-foreground">
            Draft a ChatGPT request and save it for future reuse.
          </p>
        </div>
        <GlitchNeoCard className="p-[var(--space-4)]">
          <EntityForm
            id={`chat-prompts-form-${formId}`}
            title="New ChatGPT prompt"
            fields={[
              {
                id: "title",
                label: "Title",
                placeholder: "Review macro calls",
                required: true,
              },
              {
                id: "category",
                label: "Category",
                type: "select",
                options: PROMPT_CATEGORY_OPTIONS,
                defaultValue: "ChatGPT",
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
            initialValues={{ category: "ChatGPT" }}
            submitLabel="Save"
            onSubmit={handleSave}
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
        <PromptList prompts={prompts} query={query} />
      </section>
    </div>
  );
}
