"use client";

import * as React from "react";
import { cn, slugify } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Rounded look without needing a global .planner-textarea class. */
  tone?: "default" | "pill";
};

const BASE =
  "block w-full max-w-[343px] min-h-[160px] rounded-2xl px-4 py-3 text-base " +
  "border border-[hsl(var(--border))] bg-[hsl(var(--card))] " +
  "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "resize-y transition-colors";

export default React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, id, name, "aria-label": ariaLabel, tone = "default", ...props },
  ref
) {
  const auto = React.useId();
  const fromAria = slugify(ariaLabel as string | undefined);
  // Use React-generated id by default so multiple fields sharing an aria-label
  // do not end up with duplicate ids.
  const finalId = id || auto;
  const finalName = name || fromAria || finalId;

  return (
    <textarea
      ref={ref}
      id={finalId}
      name={finalName}
      className={cn(BASE, tone === "pill" && "rounded-full min-h-[120px]", className)}
      {...props}
    />
  );
});
