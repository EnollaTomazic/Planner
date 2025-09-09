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
import { usePrompts } from "./usePrompts";

export default function PromptsPage() {
  const { prompts, query, setQuery, filtered, save } = usePrompts();

  // Drafts
  const [titleDraft, setTitleDraft] = React.useState("");
  const [textDraft, setTextDraft] = React.useState("");

  const handleSave = React.useCallback(() => {
    if (save(titleDraft, textDraft)) {
      setTitleDraft("");
      setTextDraft("");
    }
  }, [save, titleDraft, textDraft]);

  return (
    <SectionCard>
      <SectionCard.Header sticky topClassName="top-8" className="gap-3">
        <PromptsHeader
          count={prompts.length}
          query={query}
          onQueryChange={setQuery}
          onSave={handleSave}
          disabled={!titleDraft.trim() && !textDraft.trim()}
        />
      </SectionCard.Header>
      <SectionCard.Body>
        <PromptsComposePanel
          title={titleDraft}
          onTitleChange={setTitleDraft}
          text={textDraft}
          onTextChange={setTextDraft}
        />

        <PromptList prompts={filtered} />

        <PromptsDemos />
      </SectionCard.Body>
    </SectionCard>
  );
}

