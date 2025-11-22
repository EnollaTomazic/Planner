"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
import { FieldRoot } from "./Field";

export type TagInputProps = {
  value: string[];
  onChange?: (next: string[]) => void;
  placeholder?: string;
  ariaLabelledby?: string;
  helper?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
};

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag",
  ariaLabelledby,
  helper,
  className,
  disabled = false,
  readOnly = false,
}: TagInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [draft, setDraft] = React.useState("");
  const helperId = React.useId();

  const tags = React.useMemo(() => (Array.isArray(value) ? value : []), [value]);

  React.useEffect(() => {
    setDraft("");
  }, [tags]);

  function focusInput() {
    inputRef.current?.focus();
  }

  function addTag(tagRaw: string) {
    if (!onChange || disabled || readOnly) return;
    const normalized = tagRaw.trim().replace(/^#/, "");
    if (!normalized || tags.includes(normalized)) return;
    onChange([...tags, normalized]);
  }

  function removeTag(tag: string) {
    if (!onChange || disabled || readOnly) return;
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(draft);
      setDraft("");
      return;
    }

    if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <FieldRoot
      className={cn("cursor-text", className)}
      helper={helper}
      helperId={helper ? helperId : undefined}
      disabled={disabled}
      readOnly={readOnly}
      aria-labelledby={ariaLabelledby}
      onClick={focusInput}
    >
      <div className="flex min-h-[var(--control-h-md)] w-full flex-wrap items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)]">
        {tags.map((tag) => (
          <Badge
            key={tag}
            interactive
            className="group text-ui"
            title="Remove tag"
            onClick={() => removeTag(tag)}
          >
            <span>#{tag}</span>
            <X className="ml-[var(--space-1)] size-[var(--space-3)] opacity-0 transition-opacity group-hover:opacity-100" />
          </Badge>
        ))}

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-labelledby={ariaLabelledby}
          disabled={disabled}
          readOnly={readOnly}
          className="min-w-[var(--space-12)] flex-1 bg-transparent text-ui outline-none placeholder:text-muted-foreground"
        />
      </div>
    </FieldRoot>
  );
}
