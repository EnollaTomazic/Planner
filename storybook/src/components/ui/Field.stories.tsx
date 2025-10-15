import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Check, ChevronDown } from "lucide-react";

import { Field } from "@/components/ui";
import { cn } from "@/lib/utils";

type FieldOption = { value: string; label: string; disabled?: boolean };

const playgroundOptions: readonly FieldOption[] = [
  { value: "idea", label: "Idea" },
  { value: "task", label: "Task" },
  { value: "review", label: "Review" },
];

type PlaygroundVariant = "input" | "textarea" | "select" | "search";

type FieldPlaygroundProps = {
  variant: PlaygroundVariant;
  disabled: boolean;
  loading: boolean;
  invalid: boolean;
  errorMessage: string;
  showHelper: boolean;
  helperText: string;
  showCounter: boolean;
  counterMax: number;
  placeholder: string;
  defaultValue: string;
  clearable: boolean;
  options: readonly FieldOption[];
  height: "sm" | "md" | "lg" | "xl";
};

function FieldPlayground({
  variant,
  disabled,
  loading,
  invalid,
  errorMessage,
  showHelper,
  helperText,
  showCounter,
  counterMax,
  placeholder,
  defaultValue,
  clearable,
  options,
  height,
}: FieldPlaygroundProps) {
  const [value, setValue] = React.useState(defaultValue);
  const [selectValue, setSelectValue] = React.useState(() => {
    const initial = options.find((option) => option.value === defaultValue);
    if (initial) return initial.value;
    return options[0]?.value ?? "";
  });

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  React.useEffect(() => {
    const initial = options.find((option) => option.value === defaultValue);
    setSelectValue(initial?.value ?? options[0]?.value ?? "");
  }, [defaultValue, options]);

  const helper = errorMessage ? errorMessage : showHelper ? helperText : undefined;
  const helperTone = errorMessage ? "danger" : undefined;
  const resolvedInvalid = invalid || Boolean(errorMessage);
  const counter = showCounter ? `${value.length}/${counterMax}` : undefined;

  let control: React.ReactNode;

  if (variant === "textarea") {
    control = (
      <Field.Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={resolvedInvalid || undefined}
        rows={4}
      />
    );
  } else if (variant === "select") {
    control = (
      <>
        <Field.Select
          value={selectValue}
          onChange={(event) => setSelectValue(event.target.value)}
          disabled={disabled}
          aria-invalid={resolvedInvalid || undefined}
          hasEndSlot
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </Field.Select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-[var(--space-4)] top-1/2 size-[var(--space-4)] -translate-y-1/2 text-muted-foreground transition-colors duration-motion-sm ease-out group-focus-within:text-accent-foreground"
        />
      </>
    );
  } else if (variant === "search") {
    control = (
      <Field.Search
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        clearable={clearable}
      />
    );
  } else {
    control = (
      <Field.Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={resolvedInvalid || undefined}
      />
    );
  }

  return (
    <div className="max-w-xl space-y-[var(--space-3)]">
      <Field.Root
        height={variant === "textarea" ? "lg" : height}
        disabled={disabled}
        loading={loading}
        invalid={resolvedInvalid}
        helper={helper}
        helperTone={helperTone}
        counter={counter}
      >
        {control}
      </Field.Root>
    </div>
  );
}

const meta: Meta<typeof FieldPlayground> = {
  title: "Primitives/Field",
  component: FieldPlayground,
  parameters: {
    docs: {
      description: {
        component:
          "Field primitives wrap native inputs with spacing, interaction states, helper messaging, and optional counters.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["input", "textarea", "select", "search"],
    },
    options: {
      control: false,
    },
  },
  args: {
    variant: "input",
    disabled: false,
    loading: false,
    invalid: false,
    errorMessage: "",
    showHelper: false,
    helperText: "Helper text clarifies the expected content.",
    showCounter: false,
    counterMax: 60,
    placeholder: "Capture your next move",
    defaultValue: "",
    clearable: true,
    options: playgroundOptions,
    height: "md",
  },
};

export default meta;

type Story = StoryObj<typeof FieldPlayground>;

export const Playground: Story = {
  render: (args) => <FieldPlayground {...args} />,
};

export const StateGallery: Story = {
  render: () => <FieldStateGallery />,
  parameters: {
    docs: {
      description: {
        story:
          "A gallery of Field primitives showing default, hover, focus, active, disabled, loading, and error treatments across inputs, textareas, search, and select variants.",
      },
    },
  },
};

function FieldStateGallery() {
  const hoverShadow =
    "shadow-[inset_0_var(--hairline-w)_0_hsl(var(--highlight)/0.12),inset_0_calc(var(--hairline-w)*-1)_0_hsl(var(--border)/0.45)]";
  const focusRing = "ring-2 ring-[hsl(var(--ring))] ring-offset-0 ring-offset-[hsl(var(--bg))]";
  const focusValue = "Focused entry";
  const focusCounter = `${focusValue.length}/40`;

  const gridClass = "grid gap-[var(--space-4)] md:grid-cols-2";

  return (
    <div className="max-w-5xl space-y-[var(--space-8)]">
      <section className="space-y-[var(--space-3)]">
        <h3 className="type-title">Input states</h3>
        <div className={gridClass}>
          <FieldStateCard label="Default">
            <Field.Root className="w-full">
              <Field.Input placeholder="Capture a thought" />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard label="Hover">
            <Field.Root className={cn("w-full", hoverShadow)}>
              <Field.Input defaultValue="Hover simulated" aria-label="Hover" />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard
            label="Focus"
            description="Helper text and a live counter sit below the control."
          >
            <Field.Root
              className={cn("w-full", hoverShadow, focusRing)}
              helper="Guidance for the current field."
              counter={focusCounter}
            >
              <Field.Input defaultValue={focusValue} aria-invalid={false} />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard label="Active">
            <Field.Root className={cn("w-full", hoverShadow, "brightness-[0.96]")}>
              <Field.Input defaultValue="Pressed" aria-label="Active" />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard label="Disabled">
            <Field.Root className="w-full" disabled helper="Unavailable while syncing">
              <Field.Input placeholder="Disabled" disabled />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard label="Loading">
            <Field.Root className="w-full" loading helper="Saving">
              <Field.Input defaultValue="Synchronizing" aria-label="Loading" />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard label="Error">
            <Field.Root className="w-full" invalid helper="Check your entry" helperTone="danger">
              <Field.Input defaultValue="Out of range" aria-invalid />
            </Field.Root>
          </FieldStateCard>
        </div>
      </section>

      <section className="space-y-[var(--space-3)]">
        <h3 className="type-title">Textarea</h3>
        <div className={gridClass}>
          <FieldStateCard label="Default textarea">
            <Field.Root className="w-full" height="lg">
              <Field.Textarea placeholder="Add more context" rows={4} />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard label="Error textarea">
            <Field.Root
              className="w-full"
              height="lg"
              invalid
              helper="Describe the issue in 3+ characters"
              helperTone="danger"
            >
              <Field.Textarea defaultValue="No" aria-invalid rows={4} />
            </Field.Root>
          </FieldStateCard>
        </div>
      </section>

      <section className="space-y-[var(--space-3)]">
        <h3 className="type-title">Search</h3>
        <div className={gridClass}>
          <FieldStateCard label="Clearable search" description="Typing reveals a clear button.">
            <Field.Root className="w-full">
              <Field.Search defaultValue="Roadmap" aria-label="Search roadmap" />
            </Field.Root>
          </FieldStateCard>

          <FieldStateCard label="Focused search">
            <FocusedSearchField />
          </FieldStateCard>

          <FieldStateCard label="Loading search">
            <Field.Root className="w-full" loading helper="Searching">
              <Field.Search
                defaultValue="Loading"
                loading
                aria-label="Search loading"
              />
            </Field.Root>
          </FieldStateCard>
        </div>
      </section>

      <section className="space-y-[var(--space-3)]">
        <h3 className="type-title">Select</h3>
        <FieldStateCard
          label="Raised dropdown"
          description="Field.Select pairs with the same raised surface used by our floating menus."
        >
          <SelectFieldPreview />
        </FieldStateCard>
      </section>
    </div>
  );
}

function FieldStateCard({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-[var(--space-2)]">
      <div className="space-y-[var(--space-1)]">
        <span className="text-label font-medium text-muted-foreground">{label}</span>
        {description ? (
          <p className="text-label text-muted-foreground/80">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function FocusedSearchField() {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const node = inputRef.current;
    if (!node) return;
    const raf = requestAnimationFrame(() => {
      node.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Field.Root className="w-full" helper="Icon animates to full opacity on focus">
      <Field.Search ref={inputRef} placeholder="Search focus" aria-label="Search focus" />
    </Field.Root>
  );
}

const selectOptions: readonly FieldOption[] = [
  { value: "match-review", label: "Match review" },
  { value: "practice", label: "Practice plan" },
  { value: "retro", label: "Retro" },
  { value: "debrief", label: "Debrief" },
];

function SelectFieldPreview() {
  const [value, setValue] = React.useState(selectOptions[0]?.value ?? "");

  return (
    <div className="space-y-[var(--space-3)]">
      <Field.Root className="w-full">
        <Field.Select
          value={value}
          onChange={(event) => setValue(event.target.value)}
          hasEndSlot
          aria-label="Select scenario"
        >
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field.Select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-[var(--space-4)] top-1/2 size-[var(--space-4)] -translate-y-1/2 text-muted-foreground transition-colors duration-motion-sm ease-out group-focus-within:text-accent-foreground"
        />
      </Field.Root>

      <SelectDropdownPreview options={selectOptions} value={value} />
    </div>
  );
}

function SelectDropdownPreview({
  options,
  value,
}: {
  options: readonly FieldOption[];
  value: string;
}) {
  return (
    <div className="space-y-[var(--space-2)]">
      <div
        className="max-h-[var(--select-menu-max-height)] w-full overflow-y-auto rounded-[var(--radius-2xl)] bg-card/92 p-[var(--space-2)] shadow-[var(--shadow-dropdown)] backdrop-blur-xl ring-1 ring-ring/18"
      >
        <ul className="space-y-[var(--space-1)]">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value}>
                <div
                  className={cn(
                    "flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-3)] text-ui transition-colors duration-motion-sm ease-out",
                    selected
                      ? "bg-[linear-gradient(90deg,hsl(var(--accent)/0.22),hsl(var(--accent)/0.05))] text-foreground shadow-[inset_0_0_0_var(--hairline-w)_hsl(var(--accent)/0.35)]"
                      : "text-muted-foreground hover:bg-[hsl(var(--foreground)/0.04)]",
                  )}
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <Check className="size-[var(--space-4)] text-accent-foreground" aria-hidden />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-label text-muted-foreground">
        Raised panel, max height, gradient highlight, and checkmark mirror the runtime dropdown treatment.
      </p>
    </div>
  );
}
