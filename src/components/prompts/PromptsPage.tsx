"use client";

import * as React from "react";

import { PageShell } from "@/components/ui";
import { Tabs, TabList, TabPanel, type TabListItem } from "@/components/ui/primitives/Tabs";
import { usePersistentState } from "@/lib/db";
import { PromptsHeader } from "./PromptsHeader";
import { ChatPromptsTab } from "./ChatPromptsTab";
import { CodexPromptsTab } from "./CodexPromptsTab";
import { NotesTab } from "./NotesTab";
import { useChatPrompts } from "./useChatPrompts";
import { useCodexPrompts } from "./useCodexPrompts";
import { useNotes } from "./useNotes";
import { usePersonas } from "./usePersonas";

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

  const [chatTitleDraft, setChatTitleDraft] = React.useState("");
  const [chatTextDraft, setChatTextDraft] = React.useState("");
  const [codexTitleDraft, setCodexTitleDraft] = React.useState("");
  const [codexTextDraft, setCodexTextDraft] = React.useState("");

  const handleChatSave = React.useCallback(() => {
    if (saveChatPrompt(chatTitleDraft, chatTextDraft)) {
      setChatTitleDraft("");
      setChatTextDraft("");
    }
  }, [chatTitleDraft, chatTextDraft, saveChatPrompt]);

  const handleCodexSave = React.useCallback(() => {
    if (saveCodexPrompt(codexTitleDraft, codexTextDraft)) {
      setCodexTitleDraft("");
      setCodexTextDraft("");
    }
  }, [codexTextDraft, codexTitleDraft, saveCodexPrompt]);

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
      handleChatSave();
      return;
    }
    if (activeTab === "codex") {
      handleCodexSave();
    }
  }, [activeTab, handleChatSave, handleCodexSave]);

  const saveDisabled = React.useMemo(() => {
    if (activeTab === "chat") {
      return !chatTitleDraft.trim() && !chatTextDraft.trim();
    }
    if (activeTab === "codex") {
      return !codexTitleDraft.trim() && !codexTextDraft.trim();
    }
    return true;
  }, [activeTab, chatTitleDraft, chatTextDraft, codexTitleDraft, codexTextDraft]);

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
            <ChatPromptsTab
              title={chatTitleDraft}
              text={chatTextDraft}
              onTitleChange={setChatTitleDraft}
              onTextChange={setChatTextDraft}
              prompts={chatFiltered}
              query={chatQuery}
              personas={personas}
            />
          </TabPanel>

          <TabPanel value="codex" className="pb-[var(--space-8)]">
            <CodexPromptsTab
              title={codexTitleDraft}
              text={codexTextDraft}
              onTitleChange={setCodexTitleDraft}
              onTextChange={setCodexTextDraft}
              prompts={codexFiltered}
              query={codexQuery}
            />
          </TabPanel>

          <TabPanel value="notes" className="pb-[var(--space-8)]">
            <NotesTab value={notes} onChange={setNotes} />
          </TabPanel>
        </Tabs>
      </PageShell>
    </>
  );
}

