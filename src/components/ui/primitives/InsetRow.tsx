"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import styles from "./InsetRow.module.css";

export interface InsetRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  labelId?: string;
  description?: React.ReactNode;
  descriptionId?: string;
  actions?: React.ReactNode;
  errorMessage?: React.ReactNode;
  errorMessageId?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export const InsetRow = React.forwardRef<HTMLDivElement, InsetRowProps>(
  (
    {
      label,
      labelId: labelIdProp,
      description,
      descriptionId: descriptionIdProp,
      actions,
      errorMessage,
      errorMessageId: errorMessageIdProp,
      contentClassName,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const labelId = label ? labelIdProp ?? `${generatedId}-label` : undefined;
    const descriptionId = description
      ? descriptionIdProp ?? `${generatedId}-description`
      : undefined;
    const errorMessageId = errorMessage
      ? errorMessageIdProp ?? `${generatedId}-error`
      : undefined;

    const describedBy = React.useMemo(() => {
      const ids: string[] = [];
      if (descriptionId) {
        ids.push(descriptionId);
      }
      if (errorMessageId) {
        ids.push(errorMessageId);
      }
      return ids.length > 0 ? ids.join(" ") : undefined;
    }, [descriptionId, errorMessageId]);

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        className={cn(
          styles.root,
          "rounded-card border border-card-hairline/70 p-[var(--space-4)] text-foreground shadow-[var(--shadow-inner-lg)]",
          className,
        )}
        {...rest}
      >
        {(label || description || actions) && (
          <div className="flex flex-wrap items-start justify-between gap-[var(--space-2)]">
            {label ? (
              <div className="space-y-[var(--space-1)]">
                <p
                  id={labelId}
                  className="text-label font-medium text-muted-foreground"
                >
                  {label}
                </p>
                {description ? (
                  <p
                    id={descriptionId}
                    className="text-caption text-muted-foreground"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}
            {actions ? (
              <div className="flex items-center gap-[var(--space-2)] text-label font-medium">
                {actions}
              </div>
            ) : null}
            {!label && description ? (
              <p
                id={descriptionId}
                className="text-caption text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
        )}

        <div
          className={cn(
            "mt-[var(--space-3)] grid gap-[var(--space-3)]",
            contentClassName,
          )}
        >
          {children}
        </div>

        {errorMessage ? (
          <p
            id={errorMessageId}
            role="alert"
            className="mt-[var(--space-3)] text-caption font-medium text-danger"
          >
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);

InsetRow.displayName = "InsetRow";
