"use client";

import * as React from "react";
import Button from "@/components/ui/primitives/Button";
import IconButton from "@/components/ui/primitives/IconButton";
import Input from "@/components/ui/primitives/Input";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import Textarea from "@/components/ui/primitives/Textarea";
import useAutoFocus from "@/lib/useAutoFocus";
import { capitalize } from "@/lib/utils";
import { Pencil, Trash2, Pin, PinOff } from "lucide-react";
import {
  useReminders,
  Reminder,
  Group,
  Source,
  Domain,
} from "./useReminders";

export default function ReminderList() {
  const { filtered, updateReminder, removeReminder } = useReminders();

  return (
    <>
      <div className="grid grid-cols-12 gap-3">
        {filtered.map((reminder) => (
          <div key={reminder.id} className="col-span-12 md:col-span-6 lg:col-span-4">
            <RemTile
              value={reminder}
              onChange={(partial) => updateReminder(reminder.id, partial)}
              onDelete={() => removeReminder(reminder.id)}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState />}
    </>
  );
}

function EmptyState() {
  return (
    <div className="goal-card rounded-card ds-card-pad text-ui font-medium text-muted-foreground grid place-items-center">
      <p>Nothing here. Add one clear sentence you’ll read in champ select.</p>
    </div>
  );
}

function RemTile({
  value,
  onChange,
  onDelete,
}: {
  value: Reminder;
  onChange: (partial: Partial<Reminder>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(value.title);
  const [body, setBody] = React.useState(value.body ?? "");
  const [tagsText, setTagsText] = React.useState(value.tags.join(", "));
  const titleRef = React.useRef<HTMLInputElement | null>(null);

  useAutoFocus({ ref: titleRef, when: editing });

  const save = React.useCallback(() => {
    const cleanTags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    onChange({
      title: title.trim() || "Untitled",
      body: body.trim(),
      tags: cleanTags,
    });
    setEditing(false);
  }, [body, onChange, tagsText, title]);

  const pinned = !!value.pinned;
  const togglePinned = React.useCallback(() => {
    onChange({ pinned: !pinned });
  }, [onChange, pinned]);
  const togglePinnedLabel = React.useMemo(() => {
    const baseLabel = pinned ? "Unpin reminder" : "Pin reminder";
    return value.title ? `${baseLabel} ${value.title}` : baseLabel;
  }, [pinned, value.title]);

  return (
    <article className="card-neo rounded-card card-pad relative group">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              ref={titleRef}
              value={title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(event.currentTarget.value)
              }
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                event.key === "Enter" && save()
              }
              aria-label="Title"
              className="font-semibold uppercase tracking-wide"
            />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h4
                className="font-semibold uppercase tracking-wide pr-2 title-glow glitch leading-6 truncate"
                title={value.title}
              >
                {value.title}
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(true);
                }}
                aria-label={
                  value.title ? `Edit reminder ${value.title}` : "Edit reminder"
                }
                className="shrink-0"
              >
                <Pencil aria-hidden="true" />
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            title="Delete"
            aria-label="Delete"
            onClick={onDelete}
            size="sm"
            iconSize="sm"
            variant="ring"
            className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
          >
            <Trash2 />
          </IconButton>

          <IconButton
            aria-pressed={pinned}
            title={togglePinnedLabel}
            aria-label={togglePinnedLabel}
            onClick={togglePinned}
            size="sm"
            iconSize="sm"
          >
            {pinned ? <PinOff /> : <Pin />}
          </IconButton>
        </div>
      </div>

      <div className="mt-2 space-y-3">
        {editing ? (
          <>
            <label className="text-label font-medium tracking-[0.02em] opacity-70">Note</label>
            <Textarea
              aria-label="Body"
              placeholder="Short, skimmable sentence."
              value={body}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBody(event.currentTarget.value)
              }
              className="rounded-[var(--radius-2xl)]"
              resize="resize-y"
              textareaClassName="min-h-40 leading-relaxed"
            />

            <label className="text-label font-medium tracking-[0.02em] opacity-70">Tags</label>
            <Input
              aria-label="Tags (comma separated)"
              placeholder="tags, comma, separated"
              value={tagsText}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTagsText(event.currentTarget.value)
              }
            />

            <div className="segmented flex flex-wrap -m-1">
              {(
                [
                  "pregame",
                  "laning",
                  "trading",
                  "tempo",
                  "review",
                  "quick",
                ] as Group[]
              ).map((groupKey) => (
                <SegmentedButton
                  key={groupKey}
                  onClick={() => onChange({ group: groupKey })}
                  isActive={value.group === groupKey}
                  className="m-1"
                >
                  {groupKey === "pregame" ? "Pre-Game" : capitalize(groupKey)}
                </SegmentedButton>
              ))}
            </div>

            <div className="segmented flex flex-wrap -m-1">
              {(["MLA", "BLA", "BrokenByConcept", "Custom"] as Source[]).map(
                (sourceKey) => (
                  <SegmentedButton
                    key={sourceKey}
                    onClick={() => onChange({ source: sourceKey })}
                    isActive={value.source === sourceKey}
                    className="m-1"
                  >
                    {sourceKey}
                  </SegmentedButton>
                ),
              )}
            </div>

            <div className="segmented flex flex-wrap -m-1">
              {(["Life", "League", "Learn"] as Domain[]).map((domainKey) => (
                <SegmentedButton
                  key={domainKey}
                  onClick={() => onChange({ domain: domainKey })}
                  isActive={(value.domain ?? "League") === domainKey}
                  className="m-1"
                >
                  {domainKey}
                </SegmentedButton>
              ))}
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={save}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setTitle(value.title);
                  setBody(value.body ?? "");
                  setTagsText(value.tags.join(", "));
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-ui font-medium">
              <span className="opacity-70">Note:</span>{" "}
              {value.body || (
                <span className="opacity-60">
                  No text. Click title to edit.
                </span>
              )}
            </p>

            <div className="mt-1 flex items-center justify-between text-ui font-medium">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--accent-overlay))]"
                />
                <span className="text-label font-medium tracking-[0.02em]">{fmtDate(value.createdAt)}</span>
              </div>

              <button
                className="inline-flex items-center gap-[var(--space-1)] rounded-full bg-primary-soft px-[var(--space-2)] py-[var(--space-1)] text-label font-medium tracking-[0.02em] text-primary-foreground transition-colors hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                onClick={togglePinned}
                title={togglePinnedLabel}
                aria-label={togglePinnedLabel}
                aria-pressed={pinned}
                data-state={pinned ? "on" : "off"}
                type="button"
              >
                {pinned ? "Pinned" : "Pin"}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function pad(value: number) {
  return value < 10 ? `0${value}` : `${value}`;
}

function fmtDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

