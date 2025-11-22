"use client";

import * as React from "react";

import { PageShell } from "@/components/ui";
import { TabBar } from "@/components/ui/layout/TabBar";
import { usePersistentState } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
  ChatPromptsTab,
  type ChatPromptsTabHandle,
} from "./ChatPromptsTab";
import { PromptsHeader } from "./PromptsHeader";
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
import {
  PROMPTS_TAB_ID_BASE,
  PROMPTS_TAB_ITEMS,
  type PromptsTabKey,
} from "./tabs";

const TAB_STORAGE_KEY = "prompts.tab.v1" as const;

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

  const [activeTab, setActiveTab] = usePersistentState<PromptsTabKey>(
    TAB_STORAGE_KEY,
    "chat",
  );

  const tabCounts = React.useMemo(
    () => ({
      chat: chatPrompts.length,
      codex: codexPrompts.length,
      notes: notes.trim().length > 0 ? 1 : 0,
    }),
    [chatPrompts.length, codexPrompts.length, notes],
  );

  const tabItems = React.useMemo(
    () =>
      PROMPTS_TAB_ITEMS.map((item) => {
        const badge = tabCounts[item.key];
        return {
          key: item.key,
          label: item.label,
          badge: badge && badge > 0 ? badge : undefined,
          controls: `${item.key}-panel`,
        };
      }),
    [tabCounts],
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
  const pendingFocusRef = React.useRef<
    | { type: "prompt" | "persona"; tab: PromptsTabKey }
    | null
  >(null);
  const focusLoopRef = React.useRef<number | null>(null);
  const activeTabRef = React.useRef(activeTab);

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

  const ensureFocusLoop = React.useCallback(() => {
    if (focusLoopRef.current != null) {
      return;
    }

    const step = () => {
      const pending = pendingFocusRef.current;
      if (!pending) {
        focusLoopRef.current = null;
        return;
      }

      if (pending.tab === activeTabRef.current && tryFocus(pending)) {
        pendingFocusRef.current = null;
        focusLoopRef.current = null;
        return;
      }

      focusLoopRef.current = window.requestAnimationFrame(step);
    };

    focusLoopRef.current = window.requestAnimationFrame(step);
  }, [tryFocus]);

  React.useEffect(() => {
    activeTabRef.current = activeTab;
    if (pendingFocusRef.current && focusLoopRef.current == null) {
      ensureFocusLoop();
    }
  }, [activeTab, ensureFocusLoop]);

  React.useEffect(() => {
    return () => {
      if (focusLoopRef.current != null) {
        window.cancelAnimationFrame(focusLoopRef.current);
        focusLoopRef.current = null;
      }
    };
  }, []);

  const handleNewPrompt = React.useCallback(() => {
    const target: PromptsTabKey = activeTab;
    const action = { type: "prompt" as const, tab: target };
    if (tryFocus(action)) {
      pendingFocusRef.current = null;
      return;
    }

    pendingFocusRef.current = action;
    ensureFocusLoop();
  }, [activeTab, ensureFocusLoop, tryFocus]);

  const handleNewPersona = React.useCallback(() => {
    const action = { type: "persona" as const, tab: "chat" as const };
    if (activeTab === "chat" && tryFocus(action)) {
      pendingFocusRef.current = null;
      return;
    }

    pendingFocusRef.current = action;
    ensureFocusLoop();
    if (activeTab !== "chat") {
      setActiveTab("chat");
    }
  }, [activeTab, ensureFocusLoop, setActiveTab, tryFocus]);

  return (
    <>
      <PageShell as="header" className="py-[var(--space-6)]">
        <PromptsHeader
          id="prompts-header"
          query={activeQuery}
          onQueryChange={handleQueryChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewPrompt={handleNewPrompt}
          onNewPersona={handleNewPersona}
          tabCounts={tabCounts}
        />
      </PageShell>

      <PageShell
        as="main"
        id="page-main"
        tabIndex={-1}
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-labelledby="prompts-header"
      >
        <TabBar<PromptsTabKey>
          items={tabItems}
          value={activeTab}
          onValueChange={setActiveTab}
          ariaLabel="Prompt workspaces"
          ariaLabelledBy="prompts-header"
          idBase={PROMPTS_TAB_ID_BASE}
        />
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
  savePrompt: (title: string, text: string) => boolean;
  updatePrompt: (id: string, title: string, text: string) => boolean;
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
    (title: string, text: string, _category: string) => savePrompt(title, text),
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
  savePrompt: (title: string, text: string) => boolean;
  updatePrompt: (id: string, title: string, text: string) => boolean;
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
    (title: string, text: string, _category: string) => savePrompt(title, text),
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

