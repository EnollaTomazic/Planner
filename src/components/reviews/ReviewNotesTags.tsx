"use client";

import * as React from "react";
import SectionLabel from "@/components/reviews/SectionLabel";
import Input from "@/components/ui/primitives/Input";
import Textarea from "@/components/ui/primitives/Textarea";
import IconButton from "@/components/ui/primitives/IconButton";
import { Tag, Plus } from "lucide-react";

export default function ReviewNotesTags({
  notes,
  onNotesChange,
  onNotesBlur,
  tags,
  onAddTag,
  onRemoveTag,
}: {
  notes: string;
  onNotesChange: (v: string) => void;
  onNotesBlur: () => void;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [draftTag, setDraftTag] = React.useState("");

  return (
    <>
      <div>
        <SectionLabel>Tags</SectionLabel>
        <div className="mt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draftTag}
              onChange={(e) => setDraftTag(e.target.value)}
              placeholder="Add tag and press Enter"
              className="pl-6"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddTag(draftTag);
                  setDraftTag("");
                }
              }}
            />
          </div>

          <IconButton
            aria-label="Add tag"
            title="Add tag"
            size="md"
            iconSize="sm"
            variant="solid"
            onClick={() => {
              onAddTag(draftTag);
              setDraftTag("");
            }}
          >
            <Plus />
          </IconButton>
        </div>

        {tags.length === 0 ? (
          <div className="mt-2 text-sm text-muted-foreground/80">No tags yet.</div>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                className="chip h-9 px-4 text-sm group inline-flex items-center gap-1"
                title="Remove tag"
                onClick={() => onRemoveTag(t)}
              >
                <span>#{t}</span>
                <span className="opacity-0 transition-opacity group-hover:opacity-100">✕</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionLabel>Notes</SectionLabel>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={onNotesBlur}
          placeholder="Key moments, mistakes to fix, drills to run…"
          className="rounded-2xl"
          resize="resize-y"
          textareaClassName="min-h-[180px] leading-relaxed"
        />
      </div>
    </>
  );
}
