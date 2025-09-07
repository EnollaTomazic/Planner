"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";
import FieldShell from "./FieldShell";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Rounded look without needing a global .planner-textarea class. */
  tone?: "default" | "pill";
  /** Optional className for the outer wrapper */
  className?: string;
  /** Optional className for the inner <textarea> element */
  textareaClassName?: string;
};

  const INNER =
    "block w-full max-w-full min-h-7 px-4 py-3 text-base bg-transparent " +
  "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] " +
  "focus:outline-none focus-visible:outline-none resize-y disabled:opacity-50 disabled:cursor-not-allowed";

export default React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    textareaClassName,
    id,
    name,
    "aria-label": ariaLabel,
    tone = "default",
    ...props
  },
  ref
) {
  const auto = React.useId();
  const fromAria = slugify(ariaLabel as string | undefined);
  // Use React-generated id by default so multiple fields sharing an aria-label
  // do not end up with duplicate ids.
  const finalId = id || auto;
  const finalName = name || fromAria || finalId;

  const error =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";

  return (
    <FieldShell
      tone={tone}
      error={error}
      disabled={props.disabled}
      className={className}
    >
      <textarea
        ref={ref}
        id={finalId}
        name={finalName}
          className={cn(INNER, tone === "pill" && "rounded-full min-h-6", textareaClassName)}
        {...props}
      />
    </FieldShell>
  );
});
