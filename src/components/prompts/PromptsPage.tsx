"use client";

import * as React from "react";

import { Header, PageShell } from "@/components/ui";
import { HeroSearchBar } from "@/components/ui/layout/hero/HeroSearchBar";
import { Badge } from "@/components/ui/primitives/Badge";
import { Tabs, TabList, TabPanel, type TabListItem } from "@/components/ui/primitives/Tabs";
import { usePersistentState } from "@/lib/db";
import { ChatPromptsTab } from "./ChatPromptsTab";
import { PROMPTS_HEADER_CHIPS } from "./headerChips";
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

  const tabItems = React.useMemo<TabListItem<PromptsTabKey>[]>(() => {
    return BASE_TAB_ITEMS.map<TabListItem<PromptsTabKey>>((item) => ({
      ...item,
    }));
  }, []);

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

  const headerId = "prompts-header";
  const searchId = `${headerId}-search`;

  const handleChipClick = React.useCallback(
    (chip: string) => {
      const nextQuery = activeQuery === chip ? "" : chip;
      handleQueryChange(nextQuery);
    },
    [activeQuery, handleQueryChange],
  );

  const headerTabs = React.useMemo(
    () => ({
      items: tabItems,
      value: activeTab,
      onChange: setActiveTab,
      ariaLabel: "Prompt workspaces",
      variant: "neo" as const,
      showBaseline: true,
      idBase: "prompts-tabs",
    }),
    [activeTab, setActiveTab, tabItems],
  );

  const activeCount = React.useMemo(() => {
    if (activeTab === "chat") return chatPrompts.length;
    if (activeTab === "codex") return codexPrompts.length;
    return notes.trim().length > 0 ? 1 : 0;
  }, [activeTab, chatPrompts.length, codexPrompts.length, notes]);

  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <Header
          id={headerId}
          heading="Prompts"
          sticky={false}
          className="relative isolate"
          search={
            <HeroSearchBar
              id={searchId}
              value={activeQuery}
              onValueChange={handleQueryChange}
              debounceMs={300}
              placeholder="Search prompts…"
              aria-label="Search prompts"
              variant="neo"
              round
            />
          }
          actions={<span className="pill" aria-live="polite">{activeCount} saved</span>}
          tabs={headerTabs}
        >
          <div className="hidden flex-wrap items-center gap-[var(--space-2)] sm:flex">
            {PROMPTS_HEADER_CHIPS.map((chip) => {
              const isSelected = activeQuery === chip;

              return (
                <Badge
                  key={chip}
                  interactive
                  selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => handleChipClick(chip)}
                >
                  {chip}
                </Badge>
              );
            })}
          </div>
        </Header>
      </PageShell>

      <PageShell
        as="section"
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-labelledby={headerId}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} idBase="prompts-tabs">
          <TabList
            items={tabItems}
            ariaLabel="Prompt workspaces"
            className="sr-only"
            tablistClassName="hidden"
            variant="neo"
            showBaseline
          />

          <TabPanel value="chat" className="pb-[var(--space-8)]">
            <ChatTabPanel
              prompts={chatFiltered}
              query={chatQuery}
              personas={personas}
              savePrompt={saveChatPrompt}
            />
          </TabPanel>

          <TabPanel value="codex" className="pb-[var(--space-8)]">
            <React.Suspense fallback={<TabFallback>Loading Codex checklist…</TabFallback>}>
              <CodexTabPanel
                prompts={codexFiltered}
                query={codexQuery}
                savePrompt={saveCodexPrompt}
              />
            </React.Suspense>
          </TabPanel>

          <TabPanel value="notes" className="pb-[var(--space-8)]">
            <React.Suspense fallback={<TabFallback>Preparing notes…</TabFallback>}>
              <NotesTab value={notes} onChange={setNotes} />
            </React.Suspense>
          </TabPanel>
        </Tabs>
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

