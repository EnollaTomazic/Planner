"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button, Field, Input, type InputProps } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface PromptFormValues {
  title: string;
  category: string;
  prompt: string;
}

export interface PromptFormOption {
  label: string;
  value: string;
}

export interface PromptFormProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  submitLabel?: string;
  submitDisabled?: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  values: PromptFormValues;
  categories: ReadonlyArray<PromptFormOption>;
  onChange: (values: PromptFormValues) => void;
  onSubmit?: (values: PromptFormValues) => boolean | Promise<boolean>;
}

export interface PromptFormHandle {
  focus: (options?: FocusOptions) => void;
}

type PromptFormErrors = Partial<Record<keyof PromptFormValues, string>>;

const InsetInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      variant="sunken"
      className={cn("bg-card/60", className)}
      {...props}
    />
  ),
);

InsetInput.displayName = "InsetInput";

const InsetSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function InsetSelect({ className, children, ...props }, ref) {
  return (
    <Field.Root variant="sunken" className="bg-card/60">
      <Field.Select
        ref={ref}
        className={cn(
          "appearance-none pr-[calc(var(--space-6)+var(--space-2))]",
          className,
        )}
        {...props}
      >
        {children}
      </Field.Select>
      <ChevronDown className="pointer-events-none absolute right-[var(--space-4)] size-[var(--space-4)] text-muted-foreground" />
    </Field.Root>
  );
});

const InsetTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function InsetTextarea({ className, ...props }, ref) {
  return (
    <Field.Root
      variant="sunken"
      className={cn("bg-card/60 items-start", className)}
    >
      <Field.Textarea ref={ref} {...props} />
    </Field.Root>
  );
});

const DEFAULT_SUBMIT_LABEL = "Save";

const REQUIRED_MESSAGES: Record<keyof PromptFormValues, string> = {
  title: "Title is required",
  category: "Category is required",
  prompt: "Prompt is required",
};

function validatePrompt(values: PromptFormValues): PromptFormErrors {
  const errors: PromptFormErrors = {};
  if (!values.title.trim()) {
    errors.title = REQUIRED_MESSAGES.title;
  }
  if (!values.category) {
    errors.category = REQUIRED_MESSAGES.category;
  }
  if (!values.prompt.trim()) {
    errors.prompt = REQUIRED_MESSAGES.prompt;
  }
  return errors;
}

export const PromptForm = React.forwardRef<PromptFormHandle, PromptFormProps>(
  (
    {
      id,
      title,
      description,
      submitLabel = DEFAULT_SUBMIT_LABEL,
      submitDisabled,
      disabled,
      isSubmitting,
      values,
      categories,
      onChange,
      onSubmit,
    },
    ref,
  ) => {
    const formId = React.useId();
    const resolvedId = id ?? formId;

    const [errors, setErrors] = React.useState<PromptFormErrors>({});
    const [touched, setTouched] = React.useState<
      Partial<Record<keyof PromptFormValues, boolean>>
    >({});
    const [liveMessage, setLiveMessage] = React.useState<string>("");

    const titleId = React.useId();
    const categoryId = React.useId();
    const promptId = React.useId();

    const titleRef = React.useRef<HTMLInputElement | null>(null);
    const categoryRef = React.useRef<HTMLSelectElement | null>(null);
    const promptRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useImperativeHandle(
      ref,
      () => ({
        focus: (options) => {
          titleRef.current?.focus(options);
        },
      }),
      [],
    );

    React.useEffect(() => {
      if (!Object.values(errors).length) {
        setLiveMessage("");
        return;
      }
      setLiveMessage(Object.values(errors).filter(Boolean).join(" "));
    }, [errors]);

    React.useEffect(() => {
      setErrors((prev) => {
        if (!Object.keys(prev).length) {
          return prev;
        }

        const nextValidation = validatePrompt(values);
        let hasChanged = false;
        const nextErrors: PromptFormErrors = {};

        (Object.keys(prev) as (keyof PromptFormValues)[]).forEach((field) => {
          const nextError = nextValidation[field];
          nextErrors[field] = nextError;
          if (prev[field] !== nextError) {
            hasChanged = true;
          }
        });

        return hasChanged ? nextErrors : prev;
      });
    }, [values]);

    const handleFieldChange = React.useCallback(
      <Field extends keyof PromptFormValues>(field: Field) =>
        (
          event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>,
        ) => {
          const nextValue = event.target.value;
          const nextValues: PromptFormValues = {
            ...values,
            [field]: nextValue,
          } as PromptFormValues;
          onChange(nextValues);

          if (touched[field]) {
            setErrors((prev) => ({
              ...prev,
              [field]: validatePrompt(nextValues)[field],
            }));
          }
        },
      [onChange, touched, values],
    );

    const handleBlur = React.useCallback(
      (field: keyof PromptFormValues) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors((prev) => ({
          ...prev,
          [field]: validatePrompt(values)[field],
        }));
      },
      [values],
    );

    const handleSubmit = React.useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validatePrompt(values);
        setErrors(validationErrors);
        setTouched({ title: true, category: true, prompt: true });

        if (Object.keys(validationErrors).length > 0) {
          if (validationErrors.title) {
            titleRef.current?.focus();
          } else if (validationErrors.category) {
            categoryRef.current?.focus();
          } else if (validationErrors.prompt) {
            promptRef.current?.focus();
          }
          return;
        }

        if (!onSubmit) {
          return;
        }

        const result = await onSubmit(values);
        if (result !== false) {
          setErrors({});
          setTouched({});
          setLiveMessage("Form saved");
        }
      },
      [onSubmit, values],
    );

    const disableSubmit = disabled || isSubmitting || submitDisabled;

    return (
      <form
        id={resolvedId}
        onSubmit={handleSubmit}
        className="flex flex-col gap-[var(--space-4)]"
      >
        {(title || description) && (
          <header className="space-y-[var(--space-2)]">
            {title ? (
              <h4 className="text-title font-semibold tracking-[-0.01em]">
                {title}
              </h4>
            ) : null}
            {description ? (
              <p className="text-ui text-muted-foreground">{description}</p>
            ) : null}
          </header>
        )}

        <div className="space-y-[var(--space-2)]">
          <label htmlFor={titleId} className="text-ui font-medium text-foreground">
            Title
          </label>
          <InsetInput
            id={titleId}
            ref={titleRef}
            placeholder="Review macro calls"
            value={values.title}
            onChange={handleFieldChange("title")}
            onBlur={handleBlur("title")}
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            disabled={disabled}
            required
          />
          {errors.title ? (
            <p
              id={`${titleId}-error`}
              className="text-label font-medium text-danger"
              role="status"
            >
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="space-y-[var(--space-2)]">
          <label
            htmlFor={categoryId}
            className="text-ui font-medium text-foreground"
          >
            Category
          </label>
          <InsetSelect
            id={categoryId}
            ref={categoryRef}
            value={values.category}
            onChange={handleFieldChange("category")}
            onBlur={handleBlur("category")}
            aria-invalid={errors.category ? "true" : undefined}
            aria-describedby={
              errors.category ? `${categoryId}-error` : undefined
            }
            disabled={disabled}
            required
          >
            <option value="" disabled hidden>
              Select category
            </option>
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </InsetSelect>
          {errors.category ? (
            <p
              id={`${categoryId}-error`}
              className="text-label font-medium text-danger"
              role="status"
            >
              {errors.category}
            </p>
          ) : null}
        </div>

        <div className="space-y-[var(--space-2)]">
          <label
            htmlFor={promptId}
            className="text-ui font-medium text-foreground"
          >
            Prompt
          </label>
          <InsetTextarea
            id={promptId}
            ref={promptRef}
            placeholder="Write your prompt or snippet…"
            value={values.prompt}
            onChange={handleFieldChange("prompt")}
            onBlur={handleBlur("prompt")}
            rows={6}
            aria-invalid={errors.prompt ? "true" : undefined}
            aria-describedby={errors.prompt ? `${promptId}-error` : undefined}
            disabled={disabled}
            required
          />
          {errors.prompt ? (
            <p
              id={`${promptId}-error`}
              className="text-label font-medium text-danger"
              role="status"
            >
              {errors.prompt}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={disableSubmit}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </div>

        <p aria-live="polite" role="status" className="sr-only">
          {liveMessage}
        </p>
      </form>
    );
  },
);

PromptForm.displayName = "PromptForm";
