"use client";

import * as React from "react";

import { Header } from "@/components/ui/layout/Header";
import { PageShell } from "@/components/ui";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { usePersistentTab } from "@/lib/usePersistentTab";
import { cn } from "@/lib/utils";
import {
  ChatPromptsTab,
  type ChatPromptsTabHandle,
} from "./ChatPromptsTab";
import type { Persona, PromptWithTitle } from "./types";
import { useChatPrompts } from "./useChatPrompts";
import { useCodexPrompts } from "./useCodexPrompts";
import type {
  CodexPromptsTabHandle,
  CodexPromptsTabProps,
} from "./CodexPromptsTab";
import { useNotes } from "./useNotes";
import type { NotesTabHandle, NotesTabProps } from "./NotesTab";
import { usePersonas } from "./usePersonas";
import { StateTester } from "./StateTester";
import {
  PROMPTS_TAB_ID_BASE,
  PROMPTS_TAB_ITEMS,
  type PromptsTabKey,
} from "./tabs";
import { useFocusLoop } from "./useFocusLoop";

type FocusTarget = { type: "prompt" | "persona"; tab: PromptsTabKey };

const decodeTab = (value: unknown): PromptsTabKey | null => {
  if (value === "chat" || value === "codex" || value === "notes") {
    return value;
  }
  return null;
};

const TAB_STORAGE_KEY = "prompts.tab.v1" as const;
const chips = ["hover", "focus", "active", "disabled", "loading"];

const LazyCodexPromptsTab = React.lazy(async () => ({
  default: (await import("./CodexPromptsTab")).CodexPromptsTab,
})) as React.LazyExoticComponent<
  React.ForwardRefExoticComponent<
    CodexPromptsTabProps & React.RefAttributes<CodexPromptsTabHandle>
  >
>;

const LazyNotesTab = React.lazy(async () => ({
  default: (await import("./NotesTab")).NotesTab,
})) as React.LazyExoticComponent<
  React.ForwardRefExoticComponent<
    NotesTabProps & React.RefAttributes<NotesTabHandle>
  >
>;

export function PromptsPage() {
  const {
    prompts: chatPrompts,
    query: chatQuery,
    setQuery: setChatQuery,
    filtered: chatFiltered,
    save: saveChatPrompt,
    update: updateChatPrompt,
    remove: deleteChatPrompt,
  } = useChatPrompts();
  const {
    prompts: codexPrompts,
    query: codexQuery,
    setQuery: setCodexQuery,
    filtered: codexFiltered,
    save: saveCodexPrompt,
    update: updateCodexPrompt,
    remove: deleteCodexPrompt,
  } = useCodexPrompts();
  const [personas] = usePersonas();
  const [notes, setNotes] = useNotes();

  const [activeTab, setActiveTab] = usePersistentTab<PromptsTabKey>(
    TAB_STORAGE_KEY,
    "chat",
    decodeTab,
  );

  const tabCounts = React.useMemo(
    () => ({
      chat: chatPrompts.length,
      codex: codexPrompts.length,
      notes: notes.trim().length > 0 ? 1 : 0,
    }),
    [chatPrompts.length, codexPrompts.length, notes],
  );

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

  const chatTabRef = React.useRef<ChatPromptsTabHandle | null>(null);
  const codexTabRef = React.useRef<CodexPromptsTabHandle | null>(null);
  const notesTabRef = React.useRef<NotesTabHandle | null>(null);

  const tryFocus = React.useCallback(
    (pending: { type: "prompt" | "persona"; tab: PromptsTabKey }) => {
      if (pending.tab === "chat") {
        const handle = chatTabRef.current;
        if (!handle) return false;
        if (pending.type === "prompt") {
          handle.focusCompose();
        } else {
          handle.focusPersonas();
        }
        return true;
      }
      if (pending.tab === "codex") {
        const handle = codexTabRef.current;
        if (!handle) return false;
        handle.focusCompose();
        return true;
      }
      const handle = notesTabRef.current;
      if (!handle) return false;
      handle.focusScratchpad();
      return true;
    },
    [chatTabRef, codexTabRef, notesTabRef],
  );

  const { requestFocus } = useFocusLoop<PromptsTabKey, FocusTarget>(
    activeTab,
    tryFocus,
  );

  const handleNewPrompt = React.useCallback(() => {
    const target: PromptsTabKey = activeTab;
    const action = { type: "prompt" as const, tab: target };
    requestFocus(action);
  }, [activeTab, requestFocus]);

  const handleNewPersona = React.useCallback(() => {
    const action = { type: "persona" as const, tab: "chat" as const };
    const focused = requestFocus(action);
    if (!focused && activeTab !== "chat") {
      setActiveTab("chat");
    }
  }, [activeTab, requestFocus, setActiveTab]);

  const headerHeadingId = "prompts-header";
  const tabs = React.useMemo(() => {
    return PROMPTS_TAB_ITEMS.map((item) => {
      const badge = tabCounts?.[item.key];
      return {
        key: item.key,
        label: item.label,
        badge: badge && badge > 0 ? badge : undefined,
      };
    });
  }, [tabCounts]);

  const handleChipSelect = React.useCallback(
    (chip: string) => {
      const nextQuery = activeQuery === chip ? "" : chip;
      handleQueryChange(nextQuery);
    },
    [activeQuery, handleQueryChange],
  );

  return (
    <>
      <Header<PromptsTabKey>
        heading={<span id={headerHeadingId}>Prompts</span>}
        subtitle="Compose, save, and reuse AI prompts."
        variant="neo"
        underlineTone="brand"
        tabs={{
          items: tabs,
          value: activeTab,
          onChange: setActiveTab,
          ariaLabel: "Prompt workspaces",
          idBase: PROMPTS_TAB_ID_BASE,
          useSegmentedControl: true,
        }}
        actions={
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <Button size="sm" onClick={handleNewPrompt}>
              New prompt
            </Button>
            <Button size="sm" variant="quiet" onClick={handleNewPersona}>
              New persona
            </Button>
          </div>
        }
        search={
          <Input
            value={activeQuery}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search prompts…"
            aria-label="Search prompts"
            className="min-w-[16rem]"
          />
        }
      >
        <StateTester
          chips={chips}
          selectedChip={activeQuery}
          onSelect={handleChipSelect}
          className={cn("-mx-[var(--space-2)] sm:-mx-[var(--space-1)] md:mx-0")}
        />
      </Header>

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-labelledby={headerHeadingId}
      >
        {PROMPTS_TAB_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          const tabId = `${PROMPTS_TAB_ID_BASE}-${item.key}-tab`;
          const panelId = `${PROMPTS_TAB_ID_BASE}-${item.key}-panel`;

          let panelContent: React.ReactNode;
          if (item.key === "chat") {
            panelContent = (
              <ChatTabPanel
                ref={chatTabRef}
                prompts={chatFiltered}
                query={chatQuery}
                personas={personas}
                savePrompt={saveChatPrompt}
                updatePrompt={updateChatPrompt}
                deletePrompt={deleteChatPrompt}
              />
            );
          } else if (item.key === "codex") {
            panelContent = (
              <React.Suspense fallback={<TabFallback>Loading Codex checklist…</TabFallback>}>
                <CodexTabPanel
                  ref={codexTabRef}
                  prompts={codexFiltered}
                  query={codexQuery}
                  savePrompt={saveCodexPrompt}
                  updatePrompt={updateCodexPrompt}
                  deletePrompt={deleteCodexPrompt}
                />
              </React.Suspense>
            );
          } else {
            panelContent = (
              <React.Suspense fallback={<TabFallback>Preparing notes…</TabFallback>}>
                <LazyNotesTab
                  ref={notesTabRef}
                  value={notes}
                  onChange={setNotes}
                />
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
  savePrompt: (title: string, text: string, category: string) => boolean;
  updatePrompt: (
    id: string,
    title: string,
    text: string,
    category: string,
  ) => boolean;
  deletePrompt: (id: string) => boolean;
}

const ChatTabPanel = React.forwardRef<
  ChatPromptsTabHandle,
  ChatTabPanelProps
>(function ChatTabPanel(
  { prompts, query, personas, savePrompt, updatePrompt, deletePrompt },
  ref,
) {
  const handleSave = React.useCallback(
    (title: string, text: string, category: string) =>
      savePrompt(title, text, category),
    [savePrompt],
  );

  return (
    <ChatPromptsTab
      ref={ref}
      prompts={prompts}
      query={query}
      personas={personas}
      savePrompt={handleSave}
      updatePrompt={updatePrompt}
      deletePrompt={deletePrompt}
    />
  );
});

ChatTabPanel.displayName = "ChatTabPanel";

interface CodexTabPanelProps {
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

const CodexTabPanel = React.forwardRef<
  CodexPromptsTabHandle,
  CodexTabPanelProps
>(function CodexTabPanel(
  { prompts, query, savePrompt, updatePrompt, deletePrompt },
  ref,
) {
  const handleSave = React.useCallback(
    (title: string, text: string, category: string) =>
      savePrompt(title, text, category),
    [savePrompt],
  );

  return (
    <LazyCodexPromptsTab
      ref={ref}
      prompts={prompts}
      query={query}
      savePrompt={handleSave}
      updatePrompt={updatePrompt}
      deletePrompt={deletePrompt}
    />
  );
});

CodexTabPanel.displayName = "CodexTabPanel";

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

