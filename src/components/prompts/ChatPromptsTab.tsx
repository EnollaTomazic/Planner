"use client";

import * as React from "react";

import { Card } from "@/components/ui";
import { PromptsComposePanel } from "./PromptsComposePanel";
import { PromptList } from "./PromptList";
import type { Persona, PromptWithTitle } from "./types";
import { LOCALE } from "@/lib/utils";

interface ChatPromptsTabProps {
  title: string;
  text: string;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onSave: () => void;
  prompts: PromptWithTitle[];
  query: string;
  personas: Persona[];
}

export function ChatPromptsTab({
  title,
  text,
  onTitleChange,
  onTextChange,
  prompts,
  query,
  personas,
  onSave,
}: ChatPromptsTabProps) {
  const composeHeadingId = React.useId();
  const personasHeadingId = React.useId();
  const libraryHeadingId = React.useId();

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
        <PromptsComposePanel
          title={title}
          onTitleChange={onTitleChange}
          text={text}
          onTextChange={onTextChange}
          onSave={onSave}
        />
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
