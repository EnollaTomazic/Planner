"use client";

import * as React from "react";
import {
  AIExplainTooltip,
  Button,
  Field,
  Label,
  Progress,
  RadioIconGroup,
  TabBar,
  Toggle,
} from "@/components/ui";
import { Check, Code2, Info, Palette } from "lucide-react";

import { cn } from "@/lib/utils";
import { useChatPrompts } from "./useChatPrompts";

type Role = "designer" | "developer";
type StepKey = "role" | "workflow" | "advanced";
type AdvancedSettingKey =
  | "modularCss"
  | "controlHeight"
  | "interactionPolish"
  | "heroDividers";

const STEPS: readonly { key: StepKey; title: string; description: string }[] = [
  {
    key: "role",
    title: "Choose your leadership track",
    description: "Tailor onboarding guidance for your day-to-day focus.",
  },
  {
    key: "workflow",
    title: "Outline your workflow priorities",
    description: "Capture the rituals you want Planner to spotlight first.",
  },
  {
    key: "advanced",
    title: "Reveal advanced implementation settings",
    description: "Bring platform updates into your hand-off checklist.",
  },
];

type StepItem = (typeof STEPS)[number] & { index: number; label: string };

const STEP_ITEMS: StepItem[] = STEPS.map((step, index) => ({
  ...step,
  index,
  label: step.title,
}));

const ROLE_OPTIONS: React.ComponentProps<typeof RadioIconGroup>["options"] = [
  {
    id: "designer-role",
    value: "designer",
    label: "Senior Lead Designer",
    icon: <Palette className="size-[var(--space-5)]" />,
  },
  {
    id: "developer-role",
    value: "developer",
    label: "Senior Lead Developer",
    icon: <Code2 className="size-[var(--space-5)]" />,
  },
];

const ROLE_GUIDANCE: Record<
  Role,
  {
    roleTooltip: string;
    workflowHelper: string;
    collaborationHelper: string;
  }
> = {
  designer: {
    roleTooltip:
      "Review design system guidelines so prompts recommend the right foundations for your UI critiques.",
    workflowHelper:
      "Audit existing components for consistency. Call out anything that drifts from the canonical kit so Planner can flag it.",
    collaborationHelper:
      "Collaborate with developers on UI implementation by noting the specs or tokens you expect them to apply.",
  },
  developer: {
    roleTooltip:
      "Senior Lead Developers get prompts tuned for recent platform shifts — modular CSS bundles and refreshed component tokens.",
    workflowHelper:
      "WeekPicker now scrolls horizontally with snap points, showing 2–3 days at a time on smaller screens. Capture how you want to stage reviews.",
    collaborationHelper:
      "IconButton mirrors Button sizing with a new xl control height, and DurationSelector now uses accent color tokens. Note where to surface those updates.",
  },
};

type AdvancedOption = {
  key: AdvancedSettingKey;
  title: string;
  description: string;
  explanation: string;
};

const ADVANCED_OPTIONS: readonly AdvancedOption[] = [
  {
    key: "modularCss",
    title: "Adopt modular CSS bundles",
    description:
      "Animations, overlays, and utilities ship separately so rollout plans stay tidy.",
    explanation:
      "Global styles are now modularized into animations.css, overlays.css, and utilities.css. Toggle this on to remind teams to pull each layer where it belongs.",
  },
  {
    key: "controlHeight",
    title: "Enforce refreshed control sizing",
    description:
      "Lock control heights to the sm / md / xl scale during QA.",
    explanation:
      "Control height token --control-h now snaps to the xl preset to stay aligned with the base spacing grid, and Buttons default to the md size. Keep this enabled to guard those baselines.",
  },
  {
    key: "interactionPolish",
    title: "Highlight interactive polish",
    description:
      "Call out status-dot pulses and DurationSelector accent states in hand-offs.",
    explanation:
      "Review status dots blink to highlight wins and losses, and DurationSelector active states use accent color tokens. Use this reminder to verify motion and contrast tweaks.",
  },
  {
    key: "heroDividers",
    title: "Track hero + gallery tokens",
    description:
      "Keep hero dividers and color palettes aligned with the latest spacing tokens.",
    explanation:
      "Hero dividers now use var(--space-4) top padding with tokenized offsets, and the color gallery groups tokens into Aurora, Neutrals, and Accents palettes. Capture notes so the playground stays on-brand.",
  },
];

const INITIAL_ADVANCED_STATE: Record<AdvancedSettingKey, boolean> = {
  modularCss: true,
  controlHeight: true,
  interactionPolish: false,
  heroDividers: true,
};

export default function OnboardingTabs() {
  const [role, setRole] = React.useState<Role>("designer");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [skipped, setSkipped] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [workflowFocus, setWorkflowFocus] = React.useState("Audit existing UI inventory");
  const [collaborationNotes, setCollaborationNotes] = React.useState(
    "Pair with engineering on implementation spikes",
  );
  const [advancedSettings, setAdvancedSettings] = React.useState(INITIAL_ADVANCED_STATE);
  const { prompts } = useChatPrompts();
  const [updatedAt, setUpdatedAt] = React.useState<number | null>(null);
  React.useEffect(() => {
    setUpdatedAt(Date.now());
  }, []);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setUpdatedAt(Date.now());
  }, [prompts]);

  React.useEffect(() => {
    if (skipped || isComplete) return;
    contentRef.current?.focus();
  }, [stepIndex, skipped, isComplete]);

  const totalSteps = STEPS.length;
  const currentStep = STEPS[stepIndex];
  const progressValue = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const stepHeadingId = `${currentStep.key}-step-heading`;
  const roleCopy = ROLE_GUIDANCE[role];
  const canProceed = currentStep.key === "workflow" ? workflowFocus.trim().length > 0 : true;
  const stepKey = currentStep.key;

  const handleStepChange = React.useCallback(
    (key: StepKey) => {
      const nextIndex = STEP_ITEMS.findIndex((step) => step.key === key);
      if (nextIndex === -1) return;
      setStepIndex(nextIndex);
      setSkipped(false);
      setIsComplete(false);
    },
    [setStepIndex, setSkipped, setIsComplete],
  );

  const handleNext = React.useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const handleBack = React.useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleComplete = React.useCallback(() => {
    setIsComplete(true);
  }, []);

  const handleSkip = React.useCallback(() => {
    setSkipped(true);
    setIsComplete(false);
  }, []);

  const handleRestart = React.useCallback(() => {
    setSkipped(false);
    setIsComplete(false);
    setStepIndex(0);
  }, []);

  const toggleSetting = React.useCallback((key: AdvancedSettingKey, enabled: boolean) => {
    setAdvancedSettings((prev) => ({ ...prev, [key]: enabled }));
  }, []);

  let stepContent: React.ReactNode;

  switch (currentStep.key) {
    case "role": {
      const groupLabelId = "role-selection-label";
      stepContent = (
        <div className="space-y-[var(--space-3)]">
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <p id={groupLabelId} className="text-ui font-medium text-foreground">
              Which track should we prepare?
            </p>
            <AIExplainTooltip
              triggerLabel="Why choose a track?"
              explanation={roleCopy.roleTooltip}
              tone="neutral"
              triggerProps={{
                variant: "quiet",
                size: "sm",
                tone: "primary",
                className: "text-label",
              }}
              className="text-left"
            />
          </div>
          <RadioIconGroup
            name="onboarding-role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(value) => setRole(value as Role)}
            aria-labelledby={groupLabelId}
            tone="accent"
          />
        </div>
      );
      break;
    }
    case "workflow": {
      stepContent = (
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <div className="flex flex-wrap items-center gap-[var(--space-2)]">
              <Label htmlFor="workflow-focus" className="mb-0 text-ui text-foreground">
                Sprint focus
              </Label>
              <AIExplainTooltip
                triggerLabel="Need inspiration?"
                explanation={roleCopy.workflowHelper}
                tone="neutral"
                triggerProps={{
                  variant: "quiet",
                  size: "sm",
                  tone: "primary",
                  className: "text-label",
                }}
                className="text-left"
              />
            </div>
            <Field.Root helper={roleCopy.workflowHelper}>
              <Field.Input
                id="workflow-focus"
                value={workflowFocus}
                onChange={(event) => setWorkflowFocus(event.target.value)}
                placeholder={
                  role === "designer"
                    ? "Catalog tokens to audit this week"
                    : "Outline QA flow for modular CSS rollout"
                }
              />
            </Field.Root>
          </div>
          <div className="space-y-[var(--space-2)]">
            <div className="flex flex-wrap items-center gap-[var(--space-2)]">
              <Label htmlFor="collaboration-notes" className="mb-0 text-ui text-foreground">
                Collaboration notes
              </Label>
              <AIExplainTooltip
                triggerLabel="What should we capture?"
                explanation={roleCopy.collaborationHelper}
                tone="neutral"
                triggerProps={{
                  variant: "quiet",
                  size: "sm",
                  tone: "primary",
                  className: "text-label",
                }}
                className="text-left"
              />
            </div>
            <Field.Root helper={roleCopy.collaborationHelper}>
              <Field.Input
                id="collaboration-notes"
                value={collaborationNotes}
                onChange={(event) => setCollaborationNotes(event.target.value)}
                placeholder={
                  role === "designer"
                    ? "List components to review with engineering"
                    : "Note hero and gallery tokens to sync with design"
                }
              />
            </Field.Root>
          </div>
        </div>
      );
      break;
    }
    case "advanced": {
      stepContent = (
        <div className="space-y-[var(--space-3)]">
          {ADVANCED_OPTIONS.map((option) => {
            const enabled = advancedSettings[option.key];
            return (
              <div
                key={option.key}
                className="space-y-[var(--space-2)] rounded-[var(--control-radius-lg)] border border-card-hairline/60 bg-card/60 p-[var(--space-4)] shadow-depth-soft"
              >
                <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-[var(--space-1)]">
                    <p className="text-ui font-medium text-foreground">{option.title}</p>
                    <p className="text-label text-muted-foreground">{option.description}</p>
                  </div>
                  <Toggle
                    value={enabled ? "Right" : "Left"}
                    onChange={(side) => toggleSetting(option.key, side === "Right")}
                    leftLabel="Off"
                    rightLabel="On"
                  />
                </div>
                <AIExplainTooltip
                  triggerLabel="Why it matters"
                  explanation={option.explanation}
                  tone="neutral"
                  alignment="start"
                  triggerProps={{
                    variant: "quiet",
                    size: "sm",
                    tone: "primary",
                    className: "text-label",
                  }}
                  className="text-left"
                />
              </div>
            );
          })}
        </div>
      );
      break;
    }
    default: {
      stepContent = null;
    }
  }

  if (skipped || isComplete) {
    const enabledSettings = ADVANCED_OPTIONS.filter((option) => advancedSettings[option.key]);
    return (
      <div className="space-y-[var(--space-4)]">
        {skipped ? (
          <div className="space-y-[var(--space-3)] rounded-[var(--control-radius-lg)] border border-dashed border-card-hairline/80 bg-card/40 p-[var(--space-4)]">
            <div className="space-y-[var(--space-2)]">
              <p className="text-title text-foreground">Onboarding skipped</p>
              <p className="text-label text-muted-foreground">
                Jump straight into the prompts playground whenever you’re ready — you can revisit onboarding for guided setups later.
              </p>
            </div>
            <Button
              variant="quiet"
              tone="primary"
              onClick={handleRestart}
              className="inline-flex items-center gap-[var(--space-2)]"
            >
              <Info className="size-[var(--space-4)]" />
              Restart onboarding
            </Button>
          </div>
        ) : (
          <div className="space-y-[var(--space-4)] rounded-[var(--control-radius-lg)] border border-card-hairline/80 bg-card/60 p-[var(--space-4)] shadow-depth-soft">
            <div className="space-y-[var(--space-2)]">
              <p className="text-title text-foreground">You’re all set</p>
              <p className="text-label text-muted-foreground">
                Planner will steer you toward the prompts playground refactor next. Recap what you configured below.
              </p>
            </div>
            <div className="space-y-[var(--space-2)]">
              <p className="text-ui font-medium text-foreground">
                Track: {role === "designer" ? "Senior Lead Designer" : "Senior Lead Developer"}
              </p>
              <p className="text-label text-muted-foreground">Sprint focus: {workflowFocus}</p>
              <p className="text-label text-muted-foreground">Collaboration notes: {collaborationNotes}</p>
              <div className="space-y-[var(--space-1)]">
                <p className="text-ui font-medium text-foreground">Advanced reminders</p>
                {enabledSettings.length > 0 ? (
                  <ul className="list-disc pl-[var(--space-5)] text-label text-muted-foreground">
                    {enabledSettings.map((option) => (
                      <li key={option.key}>{option.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-label text-muted-foreground">
                    No advanced reminders enabled — adjust them anytime.
                  </p>
                )}
              </div>
            </div>
            <Button tone="accent" onClick={handleRestart}>
              Adjust onboarding
            </Button>
          </div>
        )}
        <p className="text-ui text-muted-foreground">
          Last updated {updatedAt ? new Date(updatedAt).toLocaleTimeString() : "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-[var(--space-2)]">
          <p className="text-label text-muted-foreground">
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <Progress
            value={progressValue}
            label={`Onboarding progress ${stepIndex + 1} of ${totalSteps}`}
          />
        </div>
        <Button variant="quiet" tone="primary" onClick={handleSkip}>
          Skip onboarding
        </Button>
      </div>

      <TabBar
        ariaLabel="Onboarding steps"
        items={STEP_ITEMS}
        value={stepKey}
        onValueChange={handleStepChange}
        variant="glitch"
        tablistClassName="w-full"
        renderItem={({ item, active, props, ref, disabled }) => {
          const { className: baseClassName, onClick, ...restProps } = props;
          const status =
            item.index < stepIndex ? "complete" : item.index === stepIndex ? "current" : "upcoming";
          const isLast = item.index === STEP_ITEMS.length - 1;
          const isDisabled = disabled;
          const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
            if (isDisabled) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            onClick?.(event);
          };

          return (
            <button
              key={item.key}
              type="button"
              {...restProps}
              ref={ref as React.Ref<HTMLButtonElement>}
              onClick={handleClick}
              disabled={isDisabled}
              className={cn(
                baseClassName,
                "glitch-wrapper group/glitch relative w-full min-w-0 flex-1 items-start gap-[var(--space-3)] rounded-[var(--control-radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-left",
                "transition-[transform,filter] duration-[180ms] ease-out",
                "focus-visible:outline-none focus-visible:ring-0",
                active && "text-foreground",
                status === "complete" && "text-foreground",
                status === "upcoming" && !active && "text-muted-foreground",
                isDisabled && "pointer-events-none opacity-disabled",
                "data-[depth=raised]:motion-safe:hover:-translate-y-[var(--spacing-0-5)] data-[depth=raised]:motion-safe:focus-visible:-translate-y-[var(--spacing-0-5)]",
                "sm:after:absolute sm:after:top-1/2 sm:after:right-[-var(--space-4)] sm:after:block sm:after:h-px sm:after:w-[var(--space-8)] sm:after:bg-border/60 data-[last=true]:sm:after:hidden",
              )}
              data-text={item.title}
              data-status={status}
              data-last={isLast ? "true" : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  "relative grid size-[var(--space-7)] place-items-center rounded-full border text-label font-medium transition-colors duration-[160ms] ease-out",
                  "shadow-[var(--depth-shadow-soft)]",
                  status === "complete" &&
                    "border-accent bg-[hsl(var(--accent)/0.18)] text-accent-foreground",
                  status === "current" &&
                    "border-primary-soft bg-[hsl(var(--primary)/0.16)] text-primary-foreground",
                  status === "upcoming" && "border-border/60 text-muted-foreground",
                  "motion-safe:group-hover/glitch:animate-[glitchJitter_0.32s_ease-in-out] motion-safe:group-focus-visible/glitch:animate-[glitchJitter_0.32s_ease-in-out]",
                )}
              >
                {status === "complete" ? (
                  <Check className="size-[var(--space-3)]" />
                ) : (
                  item.index + 1
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-[var(--space-1)]">
                <span
                  className={cn(
                    "text-label font-medium transition-colors duration-[160ms] ease-out",
                    status === "upcoming" && !active && "text-muted-foreground",
                  )}
                >
                  {item.title}
                </span>
                <span className="text-caption text-muted-foreground">
                  {item.description}
                </span>
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-[calc(var(--space-1)-var(--hairline-w))] rounded-[calc(var(--control-radius-lg)*0.9)] border border-transparent opacity-0 transition duration-[180ms] ease-out group-hover/glitch:border-[hsl(var(--accent)/0.55)] group-hover/glitch:opacity-100 group-focus-visible/glitch:border-[hsl(var(--accent)/0.7)] group-focus-visible/glitch:opacity-100 group-active/glitch:border-[hsl(var(--accent-2)/0.65)]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[var(--space-3)] bottom-[calc(var(--space-1)*-1)] h-[var(--space-1)] origin-bottom scale-y-0 rounded-full bg-[radial-gradient(80%_100%_at_50%_100%,hsl(var(--accent)/0.4),transparent)] opacity-0 transition duration-[180ms] ease-out group-hover/glitch:scale-y-100 group-hover/glitch:opacity-80 group-focus-visible/glitch:scale-y-100 group-focus-visible/glitch:opacity-90 group-active/glitch:scale-y-100"
              />
              <span
                aria-hidden
                className="glitch-rail pointer-events-none absolute inset-y-[var(--space-2)] right-[var(--space-2)] hidden w-[var(--spacing-0-75)] opacity-0 transition duration-[220ms] ease-out sm:block group-hover/glitch:opacity-80 group-focus-visible/glitch:opacity-100"
              />
            </button>
          );
        }}
      />

      <div
        ref={contentRef}
        tabIndex={-1}
        role="group"
        aria-labelledby={stepHeadingId}
        className="space-y-[var(--space-4)] rounded-[var(--control-radius-lg)] border border-card-hairline/80 bg-card/70 p-[var(--space-5)] shadow-depth-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
      >
        <div className="space-y-[var(--space-1)]">
          <p id={stepHeadingId} className="text-title text-foreground">
            {currentStep.title}
          </p>
          <p className="text-label text-muted-foreground">{currentStep.description}</p>
        </div>
        {stepContent}
      </div>

      <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="quiet"
          tone="primary"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          Back
        </Button>
        <div className="flex gap-[var(--space-2)]">
          {currentStep.key === "advanced" ? (
            <Button tone="accent" onClick={handleComplete}>
              Finish onboarding
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed}>
              Next
            </Button>
          )}
        </div>
      </div>

      <p className="text-ui text-muted-foreground">
        Last updated {updatedAt ? new Date(updatedAt).toLocaleTimeString() : "—"}
      </p>
    </div>
  );
}
