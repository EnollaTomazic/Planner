"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function slug(s?: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 64);
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Rounded look without needing a global .planner-textarea class. */
  tone?: "default" | "pill";
};

const BASE =
  "block w-full min-h-[160px] rounded-2xl px-4 py-3 text-sm " +
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
  const fromAria = slug(ariaLabel as string | undefined);
  const finalId = id || fromAria || auto;
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
