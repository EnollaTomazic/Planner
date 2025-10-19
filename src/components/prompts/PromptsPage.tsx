"use client";

import * as React from "react";

import { PageShell } from "@/components/ui";
import { Tabs, TabList, TabPanel, type TabListItem } from "@/components/ui/primitives/Tabs";
import { usePersistentState } from "@/lib/db";
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

  const chatSaveRef = React.useRef<(() => void) | null>(null);
  const codexSaveRef = React.useRef<(() => void) | null>(null);
  const [chatCanSave, setChatCanSave] = React.useState(false);
  const [codexCanSave, setCodexCanSave] = React.useState(false);

  const tabItems = React.useMemo<TabListItem<PromptsTabKey>[]>(() => {
    return BASE_TAB_ITEMS.map<TabListItem<PromptsTabKey>>((item) => {
      if (item.key === "chat") {
        return {
          ...item,
          badge: chatPrompts.length > 0 ? chatPrompts.length : undefined,
        };
      }
      if (item.key === "codex") {
        return {
          ...item,
          badge: codexPrompts.length > 0 ? codexPrompts.length : undefined,
        };
      }
      const hasNotes = notes.trim().length > 0;
      return {
        ...item,
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

  const handleSave = React.useCallback(() => {
    if (activeTab === "chat") {
      chatSaveRef.current?.();
      return;
    }
    if (activeTab === "codex") {
      codexSaveRef.current?.();
    }
  }, [activeTab]);

  const saveDisabled = React.useMemo(() => {
    if (activeTab === "chat") {
      return !chatCanSave;
    }
    if (activeTab === "codex") {
      return !codexCanSave;
    }
    return true;
  }, [activeTab, chatCanSave, codexCanSave]);

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
          onSave={handleSave}
          disabled={saveDisabled}
        />
      </PageShell>

      <PageShell
        as="section"
        className="space-y-[var(--space-6)] py-[var(--space-6)]"
        aria-labelledby="prompts-header"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} idBase="prompts-tabs">
          <TabList
            items={tabItems}
            ariaLabel="Prompt workspaces"
            variant="neo"
            showBaseline
          />

          <TabPanel value="chat" className="pb-[var(--space-8)]">
            <ChatTabPanel
              prompts={chatFiltered}
              query={chatQuery}
              personas={personas}
              savePrompt={saveChatPrompt}
              saveRef={chatSaveRef}
              onCanSaveChange={setChatCanSave}
            />
          </TabPanel>

          <TabPanel value="codex" className="pb-[var(--space-8)]">
            <React.Suspense fallback={<TabFallback>Loading Codex checklist…</TabFallback>}>
              <CodexTabPanel
                prompts={codexFiltered}
                query={codexQuery}
                savePrompt={saveCodexPrompt}
                saveRef={codexSaveRef}
                onCanSaveChange={setCodexCanSave}
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
  saveRef: React.MutableRefObject<(() => void) | null>;
  onCanSaveChange: (canSave: boolean) => void;
}

function ChatTabPanel({
  prompts,
  query,
  personas,
  savePrompt,
  saveRef,
  onCanSaveChange,
}: ChatTabPanelProps) {
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");

  const canSave = React.useMemo(() => {
    return Boolean(title.trim() || text.trim());
  }, [text, title]);

  React.useEffect(() => {
    onCanSaveChange(canSave);
  }, [canSave, onCanSaveChange]);

  React.useEffect(() => {
    return () => {
      onCanSaveChange(false);
    };
  }, [onCanSaveChange]);

  const handleSave = React.useCallback(() => {
    if (savePrompt(title, text)) {
      setTitle("");
      setText("");
    }
  }, [savePrompt, text, title]);

  React.useEffect(() => {
    saveRef.current = handleSave;
    return () => {
      if (saveRef.current === handleSave) {
        saveRef.current = null;
      }
    };
  }, [handleSave, saveRef]);

  return (
    <ChatPromptsTab
      title={title}
      text={text}
      onTitleChange={setTitle}
      onTextChange={setText}
      prompts={prompts}
      query={query}
      personas={personas}
    />
  );
}

interface CodexTabPanelProps {
  prompts: PromptWithTitle[];
  query: string;
  savePrompt: (title: string, text: string) => boolean;
  saveRef: React.MutableRefObject<(() => void) | null>;
  onCanSaveChange: (canSave: boolean) => void;
}

function CodexTabPanel({
  prompts,
  query,
  savePrompt,
  saveRef,
  onCanSaveChange,
}: CodexTabPanelProps) {
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");

  const canSave = React.useMemo(() => {
    return Boolean(title.trim() || text.trim());
  }, [text, title]);

  React.useEffect(() => {
    onCanSaveChange(canSave);
  }, [canSave, onCanSaveChange]);

  React.useEffect(() => {
    return () => {
      onCanSaveChange(false);
    };
  }, [onCanSaveChange]);

  const handleSave = React.useCallback(() => {
    if (savePrompt(title, text)) {
      setTitle("");
      setText("");
    }
  }, [savePrompt, text, title]);

  React.useEffect(() => {
    saveRef.current = handleSave;
    return () => {
      if (saveRef.current === handleSave) {
        saveRef.current = null;
      }
    };
  }, [handleSave, saveRef]);

  return (
    <CodexPromptsTab
      title={title}
      text={text}
      onTitleChange={setTitle}
      onTextChange={setText}
      prompts={prompts}
      query={query}
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

