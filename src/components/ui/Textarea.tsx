// src/components/ui/Textarea.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  tone?: "default" | "pill";
  helperText?: string;
  errorText?: string;
  success?: boolean;
  leadingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    helperText,
    errorText,
    success,
    leadingIcon,
    trailingAction,
    disabled,
    id,
    tone = "default",
    ...props
  },
  ref
) {
  function slug(s?: string) {
    return (s ?? "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .slice(0, 64);
  }

  const auto = React.useId();
  const fromAria = slug(props["aria-label"] as string | undefined);
  const finalId = id || auto;
  const finalName = props.name || fromAria || finalId;
  const describedBy = errorText ? `${finalId}-error` : helperText ? `${finalId}-helper` : undefined;
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "group relative inline-flex w-full items-start rounded-[16px] border border-[hsl(var(--border)/0.25)] bg-[hsl(var(--card)/0.6)] backdrop-blur-[2px] shadow-[0_0_0_1px_hsl(var(--border)/0.12)] transition-[box-shadow,transform] duration-150 ease-out before:content-[''] before:scanlines before:opacity-5 after:content-[''] after:noise",
          "hover:border-[hsl(var(--border)/0.35)] hover:shadow-[0_0_0_1px_hsl(var(--border)/0.2)]",
          "focus-within:ring-2 focus-within:ring-[hsl(var(--accent)/0.28)] focus-within:ring-offset-2 focus-within:ring-offset-[hsl(var(--background))] focus-within:shadow-[0_0_24px_hsl(var(--accent)/0.14)] jitter",
          tone === "pill" && "rounded-full min-h-[120px]",
          errorText && "border-[hsl(var(--destructive)/0.55)] focus-within:ring-[hsl(var(--destructive)/0.35)]",
          success && "border-[hsl(var(--success)/0.45)] focus-within:ring-[hsl(var(--success)/0.28)]",
          (disabled || props.readOnly) && "opacity-60 cursor-not-allowed focus-within:ring-0 focus-within:shadow-none",
          className
        )}
      >
        {leadingIcon && (
          <span className="pl-3.5 pt-3 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] flex items-start">
            {leadingIcon}
          </span>
        )}
        <textarea
          ref={ref}
          id={finalId}
          name={finalName}
          disabled={disabled}
          aria-invalid={errorText ? "true" : props["aria-invalid"]}
          aria-describedby={describedBy}
          className={cn(
            "flex-1 min-h-[96px] h-24 px-3.5 py-3 text-sm bg-transparent placeholder:text-[hsl(var(--muted-foreground))/0.8] text-[hsl(var(--foreground))] caret-[hsl(var(--accent))] outline-none resize-y disabled:cursor-not-allowed"
          )}
          {...props}
        />
        {trailingAction && (
          <span className="pr-3.5 pt-3 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--accent))] flex items-start">
            {trailingAction}
          </span>
        )}
      </div>
      {(helperText || errorText) && (
        <p
          id={errorText ? `${finalId}-error` : helperText ? `${finalId}-helper` : undefined}
          className={cn(
            "text-xs mt-1 line-clamp-2",
            errorText ? "text-[hsl(var(--destructive))]" : "text-[hsl(var(--muted-foreground))]"
          )}
        >
          {errorText || helperText}
        </p>
      )}
    </div>
  );
});

export default Textarea;
