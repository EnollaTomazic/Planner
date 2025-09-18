"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptList from "./PromptList";
import type { PromptWithTitle } from "./usePrompts";

interface PersonaOption {
  id: string;
  title: string;
  tone: string;
  description: string;
  prompt: string;
}

interface PromptStarter {
  id: string;
  label: string;
  title: string;
  body: string;
}

const PERSONAS: PersonaOption[] = [
  {
    id: "macro-analyst",
    title: "Macro Analyst",
    tone: "Strategy",
    description: "Dissect rotations, timer control, and objective trade-offs.",
    prompt:
      "You are a macro analyst reviewing a League of Legends match. Highlight rotation timings, objective windows, and where tempo was lost or gained. Suggest map movements that would pressure the opponent and recover tempo spikes.",
  },
  {
    id: "mechanics-coach",
    title: "Mechanics Coach",
    tone: "Execution",
    description: "Call out micro mistakes and drills to sharpen reactions.",
    prompt:
      "Act as a mechanics coach. Break down misplays, target selection, and ability usage frame-by-frame. Recommend specific practice drills to fix each issue and note situations that were played perfectly.",
  },
  {
    id: "comms-lead",
    title: "Comms Lead",
    tone: "Communication",
    description: "Track shot-calls, information gaps, and clarity in fights.",
    prompt:
      "Review the team's voice comms as a communication lead. Note high-impact calls, missing information, and moments where clarity broke down. Provide phrasing that keeps the team aligned under pressure.",
  },
];

const PROMPT_STARTERS: PromptStarter[] = [
  {
    id: "scrim-review",
    label: "Scrim postmortem",
    title: "Scrim postmortem",
    body:
      "Summarize the last scrim. Capture three wins, three losses, and the decisive moment. End with a priority list for tomorrow's block.",
  },
  {
    id: "draft-eval",
    label: "Draft feedback",
    title: "Draft feedback",
    body:
      "Evaluate our draft. Did we secure the tools needed for win conditions? Flag risky matchups, missing engage, or lack of wave control, and suggest two adjustments.",
  },
  {
    id: "patch-adapt",
    label: "Patch adaptation",
    title: "Patch adaptation checklist",
    body:
      "Audit how the latest patch changes alter our champion pools and practice priorities. Identify two comps that gain value and two that require counter strategies.",
  },
];

export interface PromptsChatPanelHandle {
  save: () => void;
  hasDraft: boolean;
}

interface PromptsChatPanelProps {
  prompts: PromptWithTitle[];
  query: string;
  onSavePrompt: (title: string, text: string) => boolean;
  onDraftStateChange?: (state: { hasDraft: boolean }) => void;
}

const PromptsChatPanel = React.forwardRef<
  PromptsChatPanelHandle,
  PromptsChatPanelProps
>(function PromptsChatPanel(
  { prompts, query, onSavePrompt, onDraftStateChange },
  ref,
) {
  const [titleDraft, setTitleDraft] = React.useState("");
  const [textDraft, setTextDraft] = React.useState("");

  const hasDraft = React.useMemo(
    () => titleDraft.trim().length > 0 || textDraft.trim().length > 0,
    [titleDraft, textDraft],
  );

  const handleSave = React.useCallback(() => {
    if (!hasDraft) return;
    const saved = onSavePrompt(titleDraft, textDraft);
    if (saved) {
      setTitleDraft("");
      setTextDraft("");
    }
  }, [hasDraft, onSavePrompt, textDraft, titleDraft]);

  const applyPersona = React.useCallback((persona: PersonaOption) => {
    setTitleDraft(persona.title);
    setTextDraft(persona.prompt);
  }, []);

  const applyStarter = React.useCallback((starter: PromptStarter) => {
    setTitleDraft((prev) => (prev.trim().length > 0 ? prev : starter.title));
    setTextDraft((prev) => {
      const base = prev.trim().length > 0 ? `${prev.trim()}\n\n` : "";
      return `${base}${starter.body}`;
    });
  }, []);

  React.useEffect(() => {
    onDraftStateChange?.({ hasDraft });
  }, [hasDraft, onDraftStateChange]);

  React.useImperativeHandle(
    ref,
    () => ({
      save: handleSave,
      hasDraft,
    }),
    [handleSave, hasDraft],
  );

  return (
    <div className="space-y-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-12">
        <div className="space-y-[var(--space-4)] lg:col-span-5">
          <Card className="h-full space-y-[var(--space-4)]">
            <CardHeader>
              <CardTitle>Compose a new prompt</CardTitle>
              <CardDescription>
                Tailor requests for reviews, VOD summaries, or scrim follow-ups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-[var(--space-4)]">
              <PromptsComposePanel
                title={titleDraft}
                onTitleChange={setTitleDraft}
                text={textDraft}
                onTextChange={setTextDraft}
              />
              <div className="space-y-[var(--space-2)]">
                <p className="text-label font-medium tracking-[0.02em] text-muted-foreground">
                  Quick starters
                </p>
                <div className="flex flex-wrap gap-[var(--space-2)]">
                  {PROMPT_STARTERS.map((starter) => (
                    <Button
                      key={starter.id}
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="border border-border/30 bg-transparent hover:bg-accent/15"
                      onClick={() => applyStarter(starter)}
                    >
                      {starter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={!hasDraft}
              >
                Save prompt
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="space-y-[var(--space-4)] lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Personas</CardTitle>
              <CardDescription>
                Swap ChatGPT&rsquo;s perspective to match the review you&rsquo;re running.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                {PERSONAS.map((persona) => (
                  <Card
                    key={persona.id}
                    asChild
                    className="h-full cursor-pointer transition-transform duration-200 hover:-translate-y-[1px]"
                  >
                    <button
                      type="button"
                      onClick={() => applyPersona(persona)}
                      className="flex h-full w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <CardHeader className="space-y-[var(--space-2)]">
                        <div className="flex items-start justify-between gap-[var(--space-2)]">
                          <CardTitle className="text-ui font-semibold">
                            {persona.title}
                          </CardTitle>
                          <Badge size="xs" tone="accent">
                            {persona.tone}
                          </Badge>
                        </div>
                        <CardDescription>{persona.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 text-ui text-muted-foreground">
                        {persona.prompt}
                      </CardContent>
                    </button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Saved prompts</CardTitle>
              <CardDescription>
                Reuse snippets filtered by your search above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromptList prompts={prompts} query={query} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default PromptsChatPanel;
