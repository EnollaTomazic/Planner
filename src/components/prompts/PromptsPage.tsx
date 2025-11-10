"use client";

import * as React from "react";

import { PageShell } from "@/components/ui";
import {
  SegmentedControl,
  type SegmentedControlOption,
} from "@/components/ui/primitives/SegmentedControl";
import { usePersistentState } from "@/lib/db";
import { cn } from "@/lib/utils";
import { ChatPromptsTab } from "./ChatPromptsTab";
import { PromptsHeader } from "./PromptsHeader";
import type { Persona, PromptWithTitle } from "./types";
import { useChatPrompts } from "./useChatPrompts";
import { useCodexPrompts } from "./useCodexPrompts";
import { useNotes } from "./useNotes";
import { usePersonas } from "./usePersonas";

const CodexPromptsTab = React.lazy(async () => ({
  default: (await import("./CodexPromptsTab")).CodexPromptsTab,
}));

const NotesTab = React.lazy(async () => ({
  default: (await import("./NotesTab")).NotesTab,
}));

const TAB_STORAGE_KEY = "prompts.tab.v1" as const;

const BASE_TAB_ITEMS = [
  { key: "chat", label: "ChatGPT" },
  { key: "codex", label: "Codex review" },
  { key: "notes", label: "Notes" },
] as const;

const PROMPTS_TAB_ID_BASE = "prompts-tabs";

type PromptsTabKey = (typeof BASE_TAB_ITEMS)[number]["key"];

export function PromptsPage() {
  const {
    prompts: chatPrompts,
    query: chatQuery,
    setQuery: setChatQuery,
    filtered: chatFiltered,
    save: saveChatPrompt,
  } = useChatPrompts();
  const {
    prompts: codexPrompts,
    query: codexQuery,
    setQuery: setCodexQuery,
    filtered: codexFiltered,
    save: saveCodexPrompt,
  } = useCodexPrompts();
  const [personas] = usePersonas();
  const [notes, setNotes] = useNotes();

  const [activeTab, setActiveTab] = usePersistentState<PromptsTabKey>(
    TAB_STORAGE_KEY,
    "chat",
  );

  const tabOptions = React.useMemo<SegmentedControlOption<PromptsTabKey>[]>(() => {
    return BASE_TAB_ITEMS.map<SegmentedControlOption<PromptsTabKey>>((item) => {
      if (item.key === "chat") {
        return {
          value: item.key,
          label: item.label,
          badge: chatPrompts.length > 0 ? chatPrompts.length : undefined,
        };
      }
      if (item.key === "codex") {
        return {
          value: item.key,
          label: item.label,
          badge: codexPrompts.length > 0 ? codexPrompts.length : undefined,
        };
      }
      const hasNotes = notes.trim().length > 0;
      return {
        value: item.key,
        label: item.label,
        badge: hasNotes ? 1 : undefined,
      };
    });
  }, [chatPrompts.length, codexPrompts.length, notes]);

  const activeQuery = React.useMemo(() => {
    if (activeTab === "chat") return chatQuery;
    if (activeTab === "codex") return codexQuery;
    return "";
  }, [activeTab, chatQuery, codexQuery]);

  const handleQueryChange = React.useCallback(
    (value: string) => {
      if (activeTab === "chat") {
        setChatQuery(value);
        return;
      }
      if (activeTab === "codex") {
        setCodexQuery(value);
      }
    },
    [activeTab, setChatQuery, setCodexQuery],
  );

  const activeCount = React.useMemo(() => {
    if (activeTab === "chat") return chatPrompts.length;
    if (activeTab === "codex") return codexPrompts.length;
    return notes.trim().length > 0 ? 1 : 0;
  }, [activeTab, chatPrompts.length, codexPrompts.length, notes]);

  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <PromptsHeader
          id="prompts-header"
          count={activeCount}
          query={activeQuery}
          onQueryChange={handleQueryChange}
        />
      </PageShell>

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-labelledby="prompts-header"
      >
        <SegmentedControl<PromptsTabKey>
          options={tabOptions}
          value={activeTab}
          onValueChange={setActiveTab}
          ariaLabel="Prompt workspaces"
          size="md"
          className="w-full"
          idBase={PROMPTS_TAB_ID_BASE}
        />

        {BASE_TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          const tabId = `${PROMPTS_TAB_ID_BASE}-${item.key}-tab`;
          const panelId = `${PROMPTS_TAB_ID_BASE}-${item.key}-panel`;

          let panelContent: React.ReactNode;
          if (item.key === "chat") {
            panelContent = (
              <ChatTabPanel
                prompts={chatFiltered}
                query={chatQuery}
                personas={personas}
                savePrompt={saveChatPrompt}
              />
            );
          } else if (item.key === "codex") {
            panelContent = (
              <React.Suspense fallback={<TabFallback>Loading Codex checklist…</TabFallback>}>
                <CodexTabPanel
                  prompts={codexFiltered}
                  query={codexQuery}
                  savePrompt={saveCodexPrompt}
                />
              </React.Suspense>
            );
          } else {
            panelContent = (
              <React.Suspense fallback={<TabFallback>Preparing notes…</TabFallback>}>
                <NotesTab value={notes} onChange={setNotes} />
              </React.Suspense>
            );
          }

          return (
            <div
              key={item.key}
              role="tabpanel"
              id={panelId}
              aria-labelledby={tabId}
              hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              data-state={isActive ? "active" : "inactive"}
              className={cn(
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[var(--shadow-glow-md)]",
                "pb-[var(--space-8)]",
              )}
            >
              {isActive ? panelContent : null}
            </div>
          );
        })}
      </PageShell>
    </>
  );
}

interface ChatTabPanelProps {
  prompts: PromptWithTitle[];
  query: string;
  personas: Persona[];
  savePrompt: (title: string, text: string) => boolean;
}

function ChatTabPanel({
  prompts,
  query,
  personas,
  savePrompt,
}: ChatTabPanelProps) {
  const handleSave = React.useCallback(
    (title: string, text: string, _category: string) => savePrompt(title, text),
    [savePrompt],
  );

  return (
    <ChatPromptsTab
      prompts={prompts}
      query={query}
      personas={personas}
      savePrompt={handleSave}
    />
  );
}

interface CodexTabPanelProps {
  prompts: PromptWithTitle[];
  query: string;
  savePrompt: (title: string, text: string) => boolean;
}

function CodexTabPanel({
  prompts,
  query,
  savePrompt,
}: CodexTabPanelProps) {
  const handleSave = React.useCallback(
    (title: string, text: string, _category: string) => savePrompt(title, text),
    [savePrompt],
  );

  return (
    <CodexPromptsTab
      prompts={prompts}
      query={query}
      savePrompt={handleSave}
    />
  );
}

function TabFallback({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-md)] border border-dashed border-border bg-muted/30 p-[var(--space-4)] text-center text-ui text-muted-foreground"
    >
      {children}
    </div>
  );
}

