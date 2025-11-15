"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button, Field, Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface PromptCategoryOption {
  label: string;
  value: string;
}

export interface PromptFormValues {
  title: string;
  category: string;
  body: string;
}

export type PromptFormSubmitResult =
  | void
  | boolean
  | Promise<void | boolean>;

export interface PromptFormProps {
  id?: string;
  heading: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  values: PromptFormValues;
  defaultCategory: string;
  categoryOptions: ReadonlyArray<PromptCategoryOption>;
  submitLabel?: string;
  onValuesChange: (values: PromptFormValues) => void;
  onSubmit?: (values: PromptFormValues) => PromptFormSubmitResult;
  titlePlaceholder?: string;
  bodyPlaceholder?: string;
  titleLabel?: string;
  categoryLabel?: string;
  bodyLabel?: string;
  bodyRows?: number;
  disabled?: boolean;
  isSubmitting?: boolean;
  resetSignal?: number;
}

const DEFAULT_SUBMIT_LABEL = "Save";
const REQUIRED_MESSAGES = {
  title: "Title is required.",
  body: "Body is required.",
} as const;

type PromptErrorMessage = (typeof REQUIRED_MESSAGES)[keyof typeof REQUIRED_MESSAGES];

type TouchedState = {
  title: boolean;
  category: boolean;
  body: boolean;
};

const DEFAULT_TOUCHED_STATE: TouchedState = {
  title: false,
  category: false,
  body: false,
};

const getPendingLabel = (label: string | undefined) => {
  if (!label) {
    return "Saving…";
  }
  if (label.toLowerCase().startsWith("update")) {
    return "Updating…";
  }
  return "Saving…";
};

const isPromiseLike = (
  value: unknown,
): value is PromiseLike<void | boolean> =>
  typeof value === "object" && value !== null && "then" in value;

export function PromptForm({
  id,
  heading,
  description,
  className,
  values,
  defaultCategory,
  categoryOptions,
  submitLabel = DEFAULT_SUBMIT_LABEL,
  onValuesChange,
  onSubmit,
  titlePlaceholder,
  bodyPlaceholder,
  titleLabel = "Title",
  categoryLabel = "Category",
  bodyLabel = "Body",
  bodyRows = 6,
  disabled = false,
  isSubmitting,
  resetSignal = 0,
}: PromptFormProps) {
  const autoId = React.useId();
  const formId = id ?? autoId;
  const titleId = `${formId}-title`;
  const categoryId = `${formId}-category`;
  const bodyId = `${formId}-body`;

  const titleRef = React.useRef<HTMLInputElement | null>(null);
  const categoryRef = React.useRef<HTMLSelectElement | null>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement | null>(null);

  const [touched, setTouched] = React.useState<TouchedState>(DEFAULT_TOUCHED_STATE);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [internalPending, setInternalPending] = React.useState(false);

  const fallbackCategory = React.useMemo(() => {
    if (categoryOptions.length === 0) {
      return defaultCategory;
    }
    const exactMatch = categoryOptions.find(
      (option) => option.value === defaultCategory,
    );
    if (exactMatch) {
      return exactMatch.value;
    }
    return categoryOptions[0]?.value ?? defaultCategory;
  }, [categoryOptions, defaultCategory]);

  const trimmedTitle = values.title.trim();
  const trimmedBody = values.body.trim();
  const resolvedCategory =
    values.category.trim() || fallbackCategory || defaultCategory;

  const validationErrors = React.useMemo<{
    title: PromptErrorMessage | null;
    body: PromptErrorMessage | null;
  }>(
    () => ({
      title: trimmedTitle ? null : REQUIRED_MESSAGES.title,
      body: trimmedBody ? null : REQUIRED_MESSAGES.body,
    }),
    [trimmedBody, trimmedTitle],
  );

  const visibleErrors = React.useMemo<{
    title: PromptErrorMessage | null;
    body: PromptErrorMessage | null;
  }>(
    () => ({
      title:
        touched.title || submitAttempted ? validationErrors.title : null,
      body: touched.body || submitAttempted ? validationErrors.body : null,
    }),
    [
      submitAttempted,
      touched.body,
      touched.title,
      validationErrors.body,
      validationErrors.title,
    ],
  );

  const liveErrorMessage = React.useMemo(() => {
    return [visibleErrors.title, visibleErrors.body]
      .filter((message): message is PromptErrorMessage => Boolean(message))
      .join(" ");
  }, [visibleErrors.body, visibleErrors.title]);

  const computedPending = isSubmitting ?? internalPending;
  const controlsDisabled = disabled || computedPending;
  const submitDisabled =
    controlsDisabled || trimmedTitle.length === 0 || trimmedBody.length === 0;

  const updateValue = React.useCallback(
    (field: keyof PromptFormValues, nextValue: string) => {
      if (values[field] === nextValue) {
        return;
      }
      onValuesChange({ ...values, [field]: nextValue });
    },
    [onValuesChange, values],
  );

  React.useEffect(() => {
    setTouched(DEFAULT_TOUCHED_STATE);
    setSubmitAttempted(false);
    if (isSubmitting === undefined) {
      setInternalPending(false);
    }
  }, [resetSignal, isSubmitting]);

  React.useEffect(() => {
    if (categoryOptions.length === 0) {
      return;
    }
    const current = values.category.trim();
    if (current && categoryOptions.some((option) => option.value === current)) {
      return;
    }
    updateValue("category", fallbackCategory);
  }, [categoryOptions, fallbackCategory, updateValue, values.category]);

  const markTouched = React.useCallback(
    (field: keyof TouchedState) => {
      setTouched((previous) => {
        if (previous[field]) {
          return previous;
        }
        return { ...previous, [field]: true };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitAttempted(true);
      setTouched({ title: true, category: true, body: true });

      if (controlsDisabled) {
        return;
      }

      if (validationErrors.title) {
        titleRef.current?.focus();
        return;
      }
      if (validationErrors.body) {
        bodyRef.current?.focus();
        return;
      }

      if (!onSubmit) {
        return;
      }

      const submission = onSubmit({
        title: trimmedTitle,
        category: resolvedCategory,
        body: trimmedBody,
      });

      if (isPromiseLike(submission)) {
        if (isSubmitting === undefined) {
          setInternalPending(true);
        }
        try {
          const result = await submission;
          if (result === false) {
            return;
          }
        } finally {
          if (isSubmitting === undefined) {
            setInternalPending(false);
          }
        }
      } else if (submission === false) {
        return;
      }
    },
    [
      controlsDisabled,
      isSubmitting,
      onSubmit,
      resolvedCategory,
      trimmedBody,
      trimmedTitle,
      validationErrors.body,
      validationErrors.title,
    ],
  );

  const buttonLabel = computedPending
    ? getPendingLabel(submitLabel)
    : submitLabel;

  return (
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit}
      aria-busy={computedPending || undefined}
      className={cn("flex flex-col gap-[var(--space-4)]", className)}
    >
      {(heading || description) && (
        <header className="space-y-[var(--space-1)]">
          {heading ? (
            <h3 className="text-title font-semibold tracking-[-0.01em]">
              {heading}
            </h3>
          ) : null}
          {description ? (
            <p className="text-ui text-muted-foreground">{description}</p>
          ) : null}
        </header>
      )}

      <div className="flex flex-col gap-[var(--space-4)]">
        <InsetInput
          id={titleId}
          label={titleLabel}
          error={visibleErrors.title}
          disabled={controlsDisabled}
        >
          {(controlProps) => (
            <Field.Root
              variant="sunken"
              invalid={Boolean(visibleErrors.title)}
              disabled={controlsDisabled}
            >
              <Field.Input
                ref={titleRef}
                {...controlProps}
                value={values.title}
                onChange={(event) => updateValue("title", event.target.value)}
                onBlur={() => markTouched("title")}
                placeholder={titlePlaceholder}
                disabled={controlsDisabled}
              />
            </Field.Root>
          )}
        </InsetInput>

        <InsetInput
          id={categoryId}
          label={categoryLabel}
          disabled={controlsDisabled}
        >
          {(controlProps) => (
            <Field.Root variant="sunken" disabled={controlsDisabled}>
              <Field.Select
                ref={categoryRef}
                {...controlProps}
                value={resolvedCategory}
                onChange={(event) => {
                  updateValue("category", event.target.value);
                  markTouched("category");
                }}
                onBlur={() => markTouched("category")}
                disabled={controlsDisabled}
                hasEndSlot
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field.Select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-[var(--space-4)] size-[var(--space-4)] text-muted-foreground transition-colors duration-motion-sm ease-out group-focus-within:text-accent-3"
              />
            </Field.Root>
          )}
        </InsetInput>

        <InsetInput
          id={bodyId}
          label={bodyLabel}
          error={visibleErrors.body}
          disabled={controlsDisabled}
        >
          {(controlProps) => (
            <Field.Root
              variant="sunken"
              invalid={Boolean(visibleErrors.body)}
              disabled={controlsDisabled}
            >
              <Field.Textarea
                ref={bodyRef}
                {...controlProps}
                value={values.body}
                onChange={(event) => updateValue("body", event.target.value)}
                onBlur={() => markTouched("body")}
                placeholder={bodyPlaceholder}
                disabled={controlsDisabled}
                rows={bodyRows}
                className="min-h-[var(--space-20)]"
              />
            </Field.Root>
          )}
        </InsetInput>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={submitDisabled}>
          {buttonLabel}
        </Button>
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveErrorMessage || " "}
      </div>
    </form>
  );
}

interface InsetInputRenderProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: "true";
}

interface InsetInputProps {
  id: string;
  label: React.ReactNode;
  error?: string | null;
  disabled?: boolean;
  children: (controlProps: InsetInputRenderProps) => React.ReactNode;
}

function InsetInput({
  id,
  label,
  error,
  children,
}: InsetInputProps) {
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;

  return (
    <div className="space-y-[var(--space-2)]">
      <Label htmlFor={id} className="text-ui font-medium text-foreground">
        {label}
      </Label>
      <div className="group relative">
        {children({
          id,
          "aria-invalid": error ? "true" : undefined,
          "aria-describedby": describedBy,
        })}
      </div>
      <p
        id={errorId}
        className={cn(
          "min-h-[var(--space-4)] text-label font-medium tracking-[0.02em]",
          error ? "text-danger" : "text-muted-foreground/60",
        )}
        aria-hidden={error ? undefined : "true"}
      >
        {error ?? " "}
      </p>
    </div>
  );
}
