"use client";

import * as React from "react";

import { Badge, Button } from "@/components/ui";
import { Field } from "@/components/ui";
import { cn } from "@/lib/utils";

export type EntityFormFieldType =
  | "text"
  | "textarea"
  | "select";

export interface EntityFormOption {
  label: string;
  value: string;
}

export interface EntityFormField {
  id: string;
  label: string;
  placeholder?: string;
  type?: EntityFormFieldType;
  options?: ReadonlyArray<EntityFormOption>;
  helper?: React.ReactNode;
  required?: boolean;
  defaultValue?: string;
  description?: React.ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  rows?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  inputType?: React.HTMLInputTypeAttribute;
}

export type EntityFormValues = Record<string, string>;

export type EntityFormSubmitResult =
  | void
  | boolean
  | Promise<void | boolean>;

export interface EntityFormProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  submitLabel?: string;
  submitDisabled?: boolean;
  resetOnSubmit?: boolean;
  initialValues?: EntityFormValues;
  fields: EntityFormField[];
  onSubmit?: (values: EntityFormValues) => EntityFormSubmitResult;
  onValuesChange?: (values: EntityFormValues) => void;
  afterFields?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  statusBadge?: React.ReactNode;
}

export interface EntityFormHandle {
  focus: (options?: FocusOptions) => void;
  reset: () => void;
}

const DEFAULT_SUBMIT_LABEL = "Save";

const areValuesEqual = (
  a: EntityFormValues,
  b: EntityFormValues,
): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

export const EntityForm = React.forwardRef<EntityFormHandle, EntityFormProps>(
  (
    {
      id,
      title,
      description,
      className,
      contentClassName,
      submitLabel = DEFAULT_SUBMIT_LABEL,
      submitDisabled,
      resetOnSubmit = true,
      initialValues,
      fields,
      onSubmit,
      onValuesChange,
      afterFields,
      footer,
      actions,
      statusBadge,
    },
    ref,
  ) => {
    const formId = React.useId();
    const resolvedId = id ?? formId;

    const defaultValues = React.useMemo(() => {
      const base: EntityFormValues = {};
      for (const field of fields) {
        const fieldId = field.id;
        base[fieldId] =
          initialValues?.[fieldId] ?? field.defaultValue ?? "";
      }
      return base;
    }, [fields, initialValues]);

    const [values, setValues] = React.useState<EntityFormValues>(defaultValues);
    const valuesRef = React.useRef(values);
    React.useEffect(() => {
      valuesRef.current = values;
    }, [values]);
    const fieldIds = React.useMemo(
      () => fields.map((field) => field.id),
      [fields],
    );
    const prevDefaultsRef = React.useRef(defaultValues);
    const prevInitialValuesRef = React.useRef(initialValues);
    const prevFieldIdsRef = React.useRef(fieldIds);
    const isFirstRenderRef = React.useRef(true);

    React.useEffect(() => {
      const prevDefaults = prevDefaultsRef.current;
      const prevInitialValues = prevInitialValuesRef.current;
      const prevFieldIds = prevFieldIdsRef.current;
      const hasFieldStructureChanged =
        prevFieldIds.length !== fieldIds.length ||
        fieldIds.some((id, index) => id !== prevFieldIds[index]);
      const defaultsChanged =
        hasFieldStructureChanged || !areValuesEqual(prevDefaults, defaultValues);
      const initialValuesChanged = prevInitialValues !== initialValues;
      const hasValuesDriftedFromDefaults =
        !areValuesEqual(valuesRef.current, defaultValues);

      if (
        isFirstRenderRef.current ||
        defaultsChanged ||
        (initialValuesChanged && hasValuesDriftedFromDefaults)
      ) {
        isFirstRenderRef.current = false;
        prevDefaultsRef.current = defaultValues;
        prevInitialValuesRef.current = initialValues;
        prevFieldIdsRef.current = fieldIds;
        valuesRef.current = defaultValues;
        setValues(defaultValues);
        onValuesChange?.(defaultValues);
        return;
      }

      prevDefaultsRef.current = defaultValues;
      prevInitialValuesRef.current = initialValues;
      prevFieldIdsRef.current = fieldIds;
      isFirstRenderRef.current = false;
    }, [defaultValues, fieldIds, initialValues, onValuesChange]);

    const firstFieldRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(
      null,
    );

    const handleFieldChange = React.useCallback(
      (fieldId: string, nextValue: string) => {
        setValues((prev) => {
          const updated = { ...prev, [fieldId]: nextValue };
          onValuesChange?.(updated);
          return updated;
        });
      },
      [onValuesChange],
    );

    const resetForm = React.useCallback(() => {
      setValues(defaultValues);
      onValuesChange?.(defaultValues);
    }, [defaultValues, onValuesChange]);

    React.useImperativeHandle(
      ref,
      () => ({
        focus: (options) => {
          firstFieldRef.current?.focus(options);
        },
        reset: resetForm,
      }),
      [resetForm],
    );

    const handleSubmit = React.useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!onSubmit) {
          return;
        }
        const result = await onSubmit(values);
        if (resetOnSubmit && result !== false) {
          resetForm();
        }
      },
      [onSubmit, resetOnSubmit, resetForm, values],
    );

    return (
      <form id={resolvedId} onSubmit={handleSubmit} className={className}>
        <div
          className={cn(
            "flex flex-col gap-[var(--space-4)]",
            contentClassName,
          )}
        >
          {(title || description || statusBadge) && (
            <header className="space-y-[var(--space-2)]">
              <div className="flex flex-wrap items-start justify-between gap-[var(--space-2)]">
                <div className="space-y-[var(--space-1)]">
                  {title ? (
                    <h3 className="text-title font-semibold tracking-[-0.01em]">
                      {title}
                    </h3>
                  ) : null}
                  {description ? (
                    <p className="text-ui text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                </div>
                {statusBadge ? (
                  <span className="shrink-0">{statusBadge}</span>
                ) : null}
              </div>
            </header>
          )}

          <div className="flex flex-col gap-[var(--space-4)]">
            {fields.map((field, index) => {
              const fieldId = `${resolvedId}-${field.id}`;
              const value = values[field.id] ?? "";
              const helperId = field.helper ? `${fieldId}-helper` : undefined;
              const descriptionId = field.description
                ? `${fieldId}-description`
                : undefined;
              const commonProps = {
                id: fieldId,
                name: field.id,
                placeholder: field.placeholder,
                value,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                  handleFieldChange(field.id, event.target.value);
                },
                required: field.required,
                disabled: field.disabled,
              } as const;

              const labelContent = (
                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <span className="text-ui font-medium text-foreground">
                    {field.label}
                  </span>
                  {field.required ? (
                    <Badge
                      size="sm"
                      tone="accent"
                      className="uppercase tracking-[0.08em]"
                      aria-hidden="true"
                    >
                      Required
                    </Badge>
                  ) : null}
                </div>
              );

              const helperContent = field.helper
                ? field.helper
                : undefined;

              return (
                <div
                  key={field.id}
                  className="space-y-[var(--space-2)]"
                >
                  <label htmlFor={fieldId} className="grid gap-[var(--space-1)]">
                    {labelContent}
                    {field.description ? (
                      <span
                        id={descriptionId}
                        className="text-label text-muted-foreground"
                      >
                        {field.description}
                      </span>
                    ) : null}
                  </label>
                  <Field.Root
                    helper={helperContent}
                    helperId={helperId}
                    className="bg-card/60"
                  >
                    {renderFieldControl({
                      field,
                      commonProps,
                      descriptionId,
                      helperId,
                      setFirstFieldRef:
                        index === 0
                          ? (element) => {
                              firstFieldRef.current = element;
                            }
                          : undefined,
                    })}
                  </Field.Root>
                </div>
              );
            })}
          </div>

          {afterFields}

          <div className="flex flex-wrap items-center justify-end gap-[var(--space-3)]">
            {actions}
            <Button type="submit" disabled={submitDisabled} size="sm">
              {submitLabel}
            </Button>
          </div>

          {footer}
        </div>
      </form>
    );
  },
);

EntityForm.displayName = "EntityForm";

interface RenderFieldControlArgs {
  field: EntityFormField;
  commonProps: {
    id: string;
    name: string;
    placeholder?: string;
    value: string;
    onChange: (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>,
    ) => void;
    required?: boolean;
    disabled?: boolean;
  };
  descriptionId?: string;
  helperId?: string;
  setFirstFieldRef?: (
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
  ) => void;
}

function renderFieldControl({
  field,
  commonProps,
  descriptionId,
  helperId,
  setFirstFieldRef,
}: RenderFieldControlArgs) {
  const fieldType = field.type ?? "text";
  const inputProps = {
    ...commonProps,
    "aria-describedby":
      descriptionId && helperId
        ? `${descriptionId} ${helperId}`
        : descriptionId ?? helperId,
  } as const;

  switch (fieldType) {
    case "textarea":
      return (
        <Field.Textarea
          {...inputProps}
          rows={field.rows}
          ref={setFirstFieldRef as React.Ref<HTMLTextAreaElement> | undefined}
        />
      );
    case "select":
      return (
        <Field.Select
          {...inputProps}
          ref={setFirstFieldRef as React.Ref<HTMLSelectElement> | undefined}
        >
          <option value="" disabled hidden>
            {field.placeholder ?? "Select"}
          </option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field.Select>
      );
    case "text":
    default:
      return (
        <Field.Input
          {...inputProps}
          type={field.inputType}
          inputMode={field.inputMode}
          ref={setFirstFieldRef as React.Ref<HTMLInputElement> | undefined}
        />
      );
  }
}
