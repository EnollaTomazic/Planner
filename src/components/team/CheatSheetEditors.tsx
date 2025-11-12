// src/components/team/CheatSheetEditors.tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/primitives/Textarea";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-label font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  );
}

export function TitleEdit({
  value,
  onChange,
  editing,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
}) {
  if (!editing)
    return (
      <h3 className="text-title sm:text-title-lg font-semibold tracking-[-0.01em] text-foreground">
        {value}
      </h3>
    );
  return (
    <input
      dir="ltr"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      className="w-full rounded-[var(--control-radius)] border border-input bg-transparent px-[var(--space-3)] py-[var(--space-2)] text-title sm:text-title-lg font-semibold tracking-[-0.01em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Archetype title"
      autoFocus
    />
  );
}

export function ParagraphEdit({
  value,
  onChange,
  editing,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
}) {
  if (!editing)
    return (
      <p className="mt-[var(--space-2)] text-body font-medium leading-relaxed text-muted-foreground">
        {value}
      </p>
    );
  return (
    <Textarea
      dir="ltr"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      rows={2}
      className="mt-[var(--space-2)]"
      resize="resize-y"
      textareaClassName="min-h-[calc(var(--spacing-8)*2+var(--spacing-7)+var(--spacing-1))] text-body font-medium text-muted-foreground leading-relaxed"
      aria-label="Description"
    />
  );
}

export function BulletListEdit({
  items,
  onChange,
  editing,
  ariaLabel,
  viewIcon,
  itemClassName,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  editing: boolean;
  ariaLabel: string;
  viewIcon?: React.ReactNode;
  itemClassName?: string;
}) {
  const [list, setList] = React.useState<string[]>(() => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean);
    return cleaned.length ? [...items] : [""];
  });
  const liRefs = React.useRef<Array<HTMLLIElement | null>>([]);

  const viewIconNode = React.useMemo(() => {
    if (!viewIcon) return null;
    if (React.isValidElement(viewIcon)) {
      const iconElement = viewIcon as React.ReactElement<{
        className?: string;
      }>;
      return React.cloneElement(iconElement, {
        className: cn("size-[var(--space-4)]", iconElement.props.className),
      });
    }
    return viewIcon;
  }, [viewIcon]);

  React.useEffect(() => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean);
    setList(cleaned.length ? [...items] : [""]);
  }, [items]);

  const scrubItemText = (el: HTMLLIElement): string => {
    el.normalize();
    const text = el.textContent ?? "";
    const hasUnsafeNodes = Array.from(el.childNodes).some(
      (node) => node.nodeType !== Node.TEXT_NODE,
    );
    if (hasUnsafeNodes) {
      el.textContent = text;
      return el.textContent ?? "";
    }
    return text;
  };

  const insertPlainText = (el: HTMLLIElement, text: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      el.textContent = text;
      return;
    }

    const range = selection.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      el.textContent = text;
      return;
    }

    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStart(textNode, textNode.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const update = (next: string[]) => {
    const trimmed = next.map((item) => item.trim());
    const filtered = trimmed.filter(Boolean);
    setList(filtered.length ? next : [""]);
    onChange(filtered.length ? filtered : []);
  };

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLLIElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    const plain = e.clipboardData?.getData("text/plain") ?? "";
    insertPlainText(el, plain);
    const text = scrubItemText(el);
    const next = [...list];
    next[i] = text;
    update(next);
  };

  const handleItemInput = (i: number, e: React.FormEvent<HTMLLIElement>) => {
    const el = e.currentTarget;
    const text = scrubItemText(el);
    const next = [...list];
    next[i] = text;
    update(next);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLLIElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = [...list];
      next.splice(i + 1, 0, "");
      update(next);
      requestAnimationFrame(() => liRefs.current[i + 1]?.focus());
    }
    if (e.key === "Backspace" && list[i] === "") {
      e.preventDefault();
      const next = [...list];
      next.splice(i, 1);
      update(next.length ? next : [""]);
      requestAnimationFrame(() => {
        const idx = i > 0 ? i - 1 : 0;
        liRefs.current[idx]?.focus();
      });
    }
  };

  if (!editing) {
    const formatted = list
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/[.?!]+$/u, ""));

    return (
      <ul className="mt-[var(--space-2)] space-y-[var(--space-2)] text-body font-medium leading-relaxed text-foreground">
        {formatted.map((w, idx) => (
          <li
            key={idx}
            className={cn(
              "flex items-start gap-[var(--space-2)]",
              itemClassName,
            )}
          >
            {viewIconNode ? (
              <span
                aria-hidden
                className="mt-[calc(var(--space-1)/2)] grid size-[var(--space-4)] place-items-center"
              >
                {viewIconNode}
              </span>
            ) : (
              <span className="mt-[calc(var(--space-1)/2)] block size-[var(--space-3)] rounded-full bg-foreground/25" />
            )}
            <span className="flex-1 text-pretty">{w}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className="mt-[var(--space-1)] list-none space-y-1 text-body font-medium leading-relaxed text-foreground"
      aria-label={ariaLabel}
    >
      {list.map((w, idx) => (
        <li
          key={idx}
          ref={(el) => {
            liRefs.current[idx] = el;
          }}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          tabIndex={0}
          dir="ltr"
          suppressContentEditableWarning
          onInput={(e) => handleItemInput(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={(e) => handlePaste(idx, e)}
          onDrop={(event) => event.preventDefault()}
          className="rounded-[var(--control-radius)] px-[var(--space-2)] py-[var(--space-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {w}
        </li>
      ))}
    </ul>
  );
}
