"use client";

/**
 * PromptsPage — Title + Search in Header (hero)
 * - Sticky header holds: Title + count (left), Search + Save (right)
 * - Body: compose panel (title + text) and the list
 */

import * as React from "react";
import { SectionCard } from "@/components/ui";
import PromptsHeader from "./PromptsHeader";
import PromptsComposePanel from "./PromptsComposePanel";
import PromptsDemos from "./PromptsDemos";
import PromptList from "./PromptList";
import { useChatPrompts } from "./useChatPrompts";
import { useNotes } from "./useNotes";

export default function PromptsPage() {
  const { prompts, query, setQuery, filtered, save } = useChatPrompts();
  const [notes, setNotes] = useNotes();

  // Drafts
  const [titleDraft, setTitleDraft] = React.useState("");

  const handleSave = React.useCallback(() => {
    if (save(titleDraft, notes)) {
      setTitleDraft("");
      setNotes("");
    }
  }, [notes, save, setNotes, titleDraft]);

  return (
    <SectionCard>
      <SectionCard.Header sticky topClassName="top-8" className="gap-3">
        <PromptsHeader
          count={prompts.length}
          query={query}
          onQueryChange={setQuery}
          onSave={handleSave}
          disabled={!titleDraft.trim() && !notes.trim()}
        />
      </SectionCard.Header>
      <SectionCard.Body>
        <PromptsComposePanel
          title={titleDraft}
          onTitleChange={setTitleDraft}
          text={notes}
          onTextChange={setNotes}
        />

        <PromptList prompts={filtered} query={query} />

        <PromptsDemos />
      </SectionCard.Body>
    </SectionCard>
  );
}

