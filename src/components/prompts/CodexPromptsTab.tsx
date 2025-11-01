"use client";

import * as React from "react";

import { PromptsComposePanel } from "./PromptsComposePanel";
import { PromptList } from "./PromptList";
import type { PromptWithTitle } from "./types";

interface CodexPromptsTabProps {
  title: string;
  text: string;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onSave: () => void;
  prompts: PromptWithTitle[];
  query: string;
}

export function CodexPromptsTab({
  title,
  text,
  onTitleChange,
  onTextChange,
  prompts,
  query,
  onSave,
}: CodexPromptsTabProps) {
  const composeHeadingId = React.useId();
  const libraryHeadingId = React.useId();

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
        <PromptsComposePanel
          title={title}
          onTitleChange={onTitleChange}
          text={text}
          onTextChange={onTextChange}
          onSave={onSave}
        />
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
