"use client";

import * as React from "react";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { usePersistentState } from "@/lib/db";
import PromptsHeader from "./PromptsHeader";
import PromptsChatPanel, { PromptsChatPanelHandle } from "./PromptsChatPanel";
import PromptsCodexPanel from "./PromptsCodexPanel";
import PromptsNotesPanel from "./PromptsNotesPanel";
import { usePrompts } from "./usePrompts";

const PROMPT_TAB_KEYS = ["chat", "codex", "notes"] as const;

type PromptsTabKey = (typeof PROMPT_TAB_KEYS)[number];

function isPromptsTabKey(value: unknown): value is PromptsTabKey {
  return (
    typeof value === "string" &&
    (PROMPT_TAB_KEYS as readonly string[]).includes(value)
  );
}

export default function PromptsPage() {
  const { prompts, query, setQuery, filtered, save } = usePrompts();
  const [activeTab, setActiveTab] = usePersistentState<PromptsTabKey>(
    "prompts.tab.v1",
    "chat",
    {
      decode: (value) => (isPromptsTabKey(value) ? value : null),
    },
  );

  const chatPanelRef = React.useRef<PromptsChatPanelHandle>(null);
  const [chatHasDraft, setChatHasDraft] = React.useState(false);

  const handleDraftStateChange = React.useCallback(
    ({ hasDraft }: { hasDraft: boolean }) => {
      setChatHasDraft(hasDraft);
    },
    [],
  );

  const handleTabChange = React.useCallback(
    (next: PromptsTabKey) => {
      setActiveTab(next);
    },
    [setActiveTab],
  );

  const handleSave = React.useCallback(() => {
    if (activeTab !== "chat") return;
    chatPanelRef.current?.save();
  }, [activeTab]);

  const isSaveDisabled = activeTab !== "chat" || !chatHasDraft;

  return (
    <Tabs<PromptsTabKey>
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-col gap-[var(--space-6)]"
    >
      <div className="sticky top-8 z-10 space-y-[var(--space-3)] bg-background/95 pb-[var(--space-3)] pt-[var(--space-3)] supports-[backdrop-filter]:backdrop-blur">
        <PromptsHeader
          count={prompts.length}
          query={query}
          onQueryChange={setQuery}
          onSave={handleSave}
          disabled={isSaveDisabled}
        />
        <TabList ariaLabel="Prompt panels" className="self-start">
          <Tab value="chat">ChatGPT workspace</Tab>
          <Tab value="codex">Codex review kits</Tab>
          <Tab value="notes">Notes</Tab>
        </TabList>
      </div>
      <TabPanel value="chat">
        <PromptsChatPanel
          ref={chatPanelRef}
          prompts={filtered}
          query={query}
          onSavePrompt={save}
          onDraftStateChange={handleDraftStateChange}
        />
      </TabPanel>
      <TabPanel value="codex">
        <PromptsCodexPanel />
      </TabPanel>
      <TabPanel value="notes">
        <PromptsNotesPanel />
      </TabPanel>
    </Tabs>
  );
}

