"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Bot, Loader2, Plus, CalendarClock, Sparkles } from "lucide-react";
import {
  Button,
  GlitchSegmentedButton,
  GlitchSegmentedGroup,
  IconButton,
  Label,
  NeoCard,
  Select,
  Textarea,
  useDialogTrap,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  buildRecurringOccurrences,
  parsePlannerPhrase,
  summariseParse,
} from "@/lib/scheduling";
import type { PlannerAssistantPlan } from "@/lib/assistant/plannerAgent";
import { planWithAssistantAction } from "@/lib/assistant/plannerAssistantAction";
import { type PlannerAssistantSafeModeState } from "@/lib/assistant/safe-mode";
import { fromISODate, toISODate } from "@/lib/date";
import {
  usePlannerActions,
  usePlannerStore,
  makeCrud,
  type ISODate,
} from "@/components/planner";

const FLOATING_BUTTON_POSITION =
  "fixed bottom-[var(--space-8)] right-[max(var(--space-3),calc((var(--viewport-width) - var(--shell-max,var(--shell-width))) / 2 + var(--space-3)))] z-50";

type Mode = "task" | "project";

function describeAssistantError(error: string | undefined, fallback: string): string {
  switch (error) {
    case "invalid_request":
      return "Planner assistant request was invalid.";
    case "safe_mode_mismatch":
      return "Planner assistant is disabled until SAFE_MODE and NEXT_PUBLIC_SAFE_MODE match.";
    case "empty_prompt":
      return "Describe what you want before asking the planner assistant.";
    case "budget_exhausted":
      return "Your request is too long for the planner assistant.";
    default:
      return fallback;
  }
}

function formatConfidence(
  confidence: PlannerAssistantPlan["suggestions"][number]["confidence"],
): string {
  if (confidence === "none") {
    return "None";
  }
  return confidence.replace(/^(.)/, (letter) => letter.toUpperCase());
}

function formatSchedule(
  schedule: PlannerAssistantPlan["suggestions"][number]["schedule"] | undefined,
): string | null {
  if (!schedule) {
    return null;
  }

  if (schedule.date && schedule.time) {
    return `${schedule.date} at ${schedule.time}`;
  }

  if (schedule.date) {
    return schedule.date;
  }

  if (schedule.time) {
    return schedule.time;
  }

  return null;
}

type PlannerCreationDialogProps = {
  open: boolean;
  onClose: VoidFunction;
  titleId: string;
  descriptionId: string;
  summaryId: string;
  children: React.ReactNode;
};

function PlannerCreationDialog({
  open,
  onClose,
  titleId,
  descriptionId,
  summaryId,
  children,
}: PlannerCreationDialogProps) {
  const mountedRef = React.useRef(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useDialogTrap({ open: open && mountedRef.current, onClose, ref: dialogRef });

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--bg)/0.85)] px-[var(--space-4)] pb-[var(--space-6)] pt-[var(--space-8)] sm:items-center sm:bg-[hsl(var(--bg)/0.8)]">
      <div
        role="presentation"
        aria-hidden="true"
        className="absolute inset-0"
        onClick={onClose}
      />
      <NeoCard
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-details={summaryId}
        className="relative w-full max-w-[min(calc(var(--space-16)*3+var(--space-8)),calc(var(--shell-width)*0.9))] card-pad space-y-[var(--space-5)]"
      >
        <IconButton
          aria-label="Close creation sheet"
          variant="quiet"
          tone="primary"
          size="sm"
          className="absolute right-[var(--space-3)] top-[var(--space-3)]"
          onClick={onClose}
        >
          <span className="sr-only">Close planner creation sheet</span>
          {/* Using Plus with rotation for consistent glyph weight */}
          <Plus className="rotate-45" />
        </IconButton>
        {children}
      </NeoCard>
    </div>,
    document.body,
  );
}

function useKeyboardShortcut(openSheet: VoidFunction) {
  React.useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      if (event.shiftKey && key === "n") {
        event.preventDefault();
        openSheet();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [openSheet]);
}

const SEGMENT_OPTIONS: Array<{ value: Mode; label: string }> = [
  { value: "task", label: "Task" },
  { value: "project", label: "Project" },
];

export function PlannerFab() {
  const { focus, getDay, upsertDay } = usePlannerStore();
  const { createProject, createTask } = usePlannerActions();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("task");
  const [inputValue, setInputValue] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [assistantPlan, setAssistantPlan] = React.useState<PlannerAssistantPlan | null>(null);
  const [assistantError, setAssistantError] = React.useState<string | null>(null);
  const [assistantSafeMode, setAssistantSafeMode] =
    React.useState<PlannerAssistantSafeModeState | null>(null);
  const [assistantLoading, startAssistantTransition] = React.useTransition();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const assistantRequestIdRef = React.useRef(0);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const summaryId = React.useId();
  const aiHeadingId = React.useId();
  const aiDisclosureId = React.useId();

  const focusDate = React.useMemo(() => fromISODate(focus) ?? new Date(), [focus]);

  const parsed = React.useMemo(
    () => parsePlannerPhrase(inputValue, { now: focusDate }),
    [focusDate, inputValue],
  );

  const targetIso = React.useMemo<ISODate>(
    () => parsed.event.startDate ?? focus,
    [parsed.event.startDate, focus],
  );

  const targetDay = getDay(targetIso);
  const projects = targetDay.projects;
  const focusProjects = getDay(focus).projects;

  React.useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  React.useEffect(
    () => () => {
      assistantRequestIdRef.current += 1;
    },
    [],
  );

  React.useEffect(() => {
    if (parsed.intent === "project" && parsed.confidence !== "low") {
      setMode("project");
    }
  }, [parsed.confidence, parsed.intent]);

  React.useEffect(() => {
    if (mode !== "task") return;
    if (projects.some((project) => project.id === selectedProjectId)) return;
    if (focusProjects.some((project) => project.id === selectedProjectId)) return;
    const fallback = projects[0]?.id ?? focusProjects[0]?.id ?? "";
    if (fallback !== selectedProjectId) {
      setSelectedProjectId(fallback);
    }
  }, [focusProjects, mode, projects, selectedProjectId]);

  React.useEffect(() => {
    if (inputValue.trim()) {
      return;
    }
    setAssistantPlan(null);
    setAssistantError(null);
    setAssistantSafeMode(null);
    assistantRequestIdRef.current += 1;
  }, [inputValue]);

  React.useEffect(() => {
    if (!open) {
      setInputValue("");
      setError(null);
      setMode("task");
      setAssistantPlan(null);
      setAssistantError(null);
      setAssistantSafeMode(null);
      assistantRequestIdRef.current += 1;
    }
  }, [open]);

  const recurringSuggestions = React.useMemo(() => {
    if (!parsed.recurrence) return [] as ISODate[];
    return buildRecurringOccurrences(parsed.recurrence, {
      startDate: parsed.event.startDate ?? focus,
      now: focusDate,
      count: 3,
    });
  }, [focus, focusDate, parsed.event.startDate, parsed.recurrence]);

  const summaryText = React.useMemo(() => summariseParse(parsed), [parsed]);

  const openSheet = React.useCallback(() => {
    setOpen(true);
  }, []);

  const closeSheet = React.useCallback(() => {
    setOpen(false);
  }, []);

  useKeyboardShortcut(openSheet);

  const handleSubmit = React.useCallback(
    (isoOverride?: ISODate) => {
      const trimmed = (parsed.event.title || inputValue).trim();
      if (!trimmed) {
        setError("Describe what you want to plan");
        return;
      }
      const iso = isoOverride ?? parsed.event.startDate ?? focus;
      if (!iso) {
        setError("Unable to determine a target date");
        return;
      }

      if (mode === "project" || parsed.intent === "project") {
        const created = createProject({ iso, name: trimmed });
        if (created) {
          setError(null);
          closeSheet();
        } else {
          setError("Enter a project name to continue");
        }
        return;
      }

      const dayProjects = getDay(iso).projects;
      let projectId = dayProjects.some((project) => project.id === selectedProjectId)
        ? selectedProjectId
        : dayProjects[0]?.id ?? "";
      if (!projectId && selectedProjectId) {
        const focusProjects = getDay(focus).projects;
        const sourceProject = focusProjects.find(
          (project) => project.id === selectedProjectId,
        );
        if (sourceProject) {
          const clonedId = makeCrud(iso, upsertDay).addProject(sourceProject.name);
          if (clonedId) {
            projectId = clonedId;
          }
        }
      }
      if (!projectId) {
        setError("Create a project for this day first");
        return;
      }
      if (projectId !== selectedProjectId) {
        setSelectedProjectId(projectId);
      }
      const createdTaskId = createTask({ iso, projectId, title: trimmed });
      if (!createdTaskId) {
        setError("Unable to create a task");
        return;
      }
      if (parsed.event.time) {
        makeCrud(iso, upsertDay).updateTaskReminder(createdTaskId, {
          enabled: true,
          time: parsed.event.time,
          leadMinutes: 0,
        });
      }
      setError(null);
      closeSheet();
    },
    [
      closeSheet,
      createProject,
      createTask,
      focus,
      getDay,
      inputValue,
      mode,
      parsed.event.startDate,
      parsed.event.time,
      parsed.event.title,
      parsed.intent,
      selectedProjectId,
      upsertDay,
    ],
  );

  const handleSubmitEvent = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSubmit();
    },
    [handleSubmit],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLFormElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleAskAssistant = React.useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setAssistantPlan(null);
      setAssistantError("Describe what you want before asking the planner assistant.");
      setAssistantSafeMode(null);
      return;
    }

    setAssistantPlan(null);
    setAssistantError(null);

    const requestId = assistantRequestIdRef.current + 1;
    assistantRequestIdRef.current = requestId;

    startAssistantTransition(async () => {
      try {
        const result = await planWithAssistantAction({
          prompt: trimmed,
          focusDate: targetIso,
        });

        if (requestId !== assistantRequestIdRef.current) {
          return;
        }

        if (result.ok) {
          setAssistantSafeMode(result.safeMode);
          setAssistantPlan(result.plan);
          setAssistantError(null);
          return;
        }

        setAssistantSafeMode(result.safeMode);
        setAssistantPlan(null);
        setAssistantError(
          describeAssistantError(
            result.error,
            result.message ?? "Planner assistant is unavailable.",
          ),
        );
      } catch (error) {
        if (requestId !== assistantRequestIdRef.current) {
          return;
        }
        setAssistantPlan(null);
        setAssistantError(
          error instanceof Error
            ? error.message
            : "Planner assistant request failed.",
        );
        setAssistantSafeMode(null);
      }
    });
  }, [inputValue, startAssistantTransition, targetIso]);

  const projectItems = React.useMemo(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    [projects],
  );

  const hasRecurringSuggestions =
    parsed.recurrence && recurringSuggestions.length > 0;
  const showAiSuggestions = Boolean(summaryText || hasRecurringSuggestions);

  return (
    <>
      <Button
        aria-label="Open planner creation sheet"
        className={cn(
          FLOATING_BUTTON_POSITION,
          "h-[var(--space-12)] min-w-[var(--space-12)] rounded-full px-[var(--space-5)] shadow-[var(--depth-shadow-outer-strong)]",
        )}
        onClick={openSheet}
        variant="default"
        tone="primary"
        size="lg"
      >
        <Plus className="[&_path]:stroke-[2.2]" />
        <span className="sr-only">Plan something new</span>
      </Button>
      <PlannerCreationDialog
        open={open}
        onClose={closeSheet}
        titleId={titleId}
        descriptionId={descriptionId}
        summaryId={summaryId}
      >
        <div className="space-y-[var(--space-2)]">
          <h2
            id={titleId}
            className="text-title font-semibold tracking-[-0.01em] text-foreground"
          >
            Plan something new
          </h2>
          <p
            id={descriptionId}
            className="text-label text-muted-foreground"
          >
            Describe your plan in natural language or switch to manual mode. Press Cmd/Ctrl + Shift + N to open, Cmd/Ctrl + Enter to save.
          </p>
        </div>
        <form
          className="space-y-[var(--space-5)]"
          onSubmit={handleSubmitEvent}
          onKeyDown={handleKeyDown}
        >
          <fieldset className="space-y-[var(--space-3)]">
            <legend className="text-label font-medium text-muted-foreground">
              Creation mode
            </legend>
            <GlitchSegmentedGroup
              value={mode}
              onChange={(value) => setMode(value as Mode)}
              ariaLabelledby={undefined}
              aria-label="Planner creation mode"
              className="max-w-max"
            >
              {SEGMENT_OPTIONS.map((option) => (
                <GlitchSegmentedButton key={option.value} value={option.value}>
                  {option.label}
                </GlitchSegmentedButton>
              ))}
            </GlitchSegmentedGroup>
          </fieldset>
          <div className="space-y-[var(--space-3)]">
            <Label htmlFor={`${titleId}-textarea`} className="text-label font-medium text-muted-foreground">
              What are you planning?
            </Label>
            <Textarea
              id={`${titleId}-textarea`}
              ref={textareaRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Daily standup every weekday at 9am"
              resize="resize-none"
              rows={4}
              className="[&_.textarea]:rounded-[var(--radius-card)]"
              textareaClassName="text-ui"
            />
          </div>
          {mode === "task" && (
            <div className="space-y-[var(--space-3)]">
              <Label htmlFor={`${titleId}-project`} className="text-label font-medium text-muted-foreground">
                Select a project for {toISODate(targetIso)}
              </Label>
              <Select
                id={`${titleId}-project`}
                items={projectItems}
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                placeholder={projectItems.length ? undefined : "No projects available"}
                disabled={!projectItems.length}
                size="md"
              />
            </div>
          )}
          {showAiSuggestions && (
            <section
              aria-labelledby={aiHeadingId}
              aria-describedby={aiDisclosureId}
              aria-live="polite"
              className="space-y-[var(--space-3)]"
            >
              <div className="space-y-[var(--space-1)]">
                <p
                  id={aiHeadingId}
                  className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground"
                >
                  AI suggestions
                </p>
                <p className="sr-only" role="note">
                  These planning suggestions are generated by AI.
                </p>
              </div>
              {summaryText && (
                <div
                  id={summaryId}
                  role="status"
                  aria-live="polite"
                  className="flex items-start gap-[var(--space-3)] rounded-[var(--radius-md)] bg-[hsl(var(--card)/0.6)] px-[var(--space-4)] py-[var(--space-3)] text-label text-muted-foreground"
                >
                  <CalendarClock className="mt-[var(--space-0_5)] size-[var(--space-5)]" aria-hidden />
                  <div className="space-y-[var(--space-1)]">
                    <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      AI suggestion
                    </p>
                    <p className="font-medium text-foreground">AI-detected details</p>
                    <p>{summaryText}</p>
                  </div>
                </div>
              )}
              {hasRecurringSuggestions && (
                <div role="status" aria-live="polite" className="space-y-[var(--space-2)]">
                  <div className="space-y-[var(--space-1)]">
                    <p className="text-caption font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      AI suggestion
                    </p>
                    <p className="flex items-center gap-[var(--space-2)] text-label font-medium text-muted-foreground">
                      <Sparkles className="size-[var(--space-4)]" aria-hidden />
                      AI upcoming occurrences
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-[var(--space-2)]">
                    {recurringSuggestions.map((iso) => (
                      <Button
                        key={iso}
                        type="button"
                        variant="neo"
                        size="sm"
                        onClick={() => handleSubmit(iso)}
                        className="rounded-full"
                      >
                        {iso}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div
                className="space-y-[var(--space-2)]"
                aria-live="polite"
              >
                <div className="flex items-center gap-[var(--space-2)] text-label font-medium text-muted-foreground">
                  <Bot className="size-[var(--space-4)]" aria-hidden />
                  Planner assistant
                </div>
                {assistantPlan?.summary && (
                  <p className="text-caption text-muted-foreground">
                    {assistantPlan.summary}
                  </p>
                )}
                {assistantPlan?.suggestions.length ? (
                  <ul className="space-y-[var(--space-2)]">
                    {assistantPlan.suggestions.map((suggestion) => {
                      const scheduleText = formatSchedule(suggestion.schedule);
                      return (
                        <li
                          key={suggestion.id}
                          className="rounded-[var(--radius-md)] border border-dashed border-muted-foreground/40 px-[var(--space-4)] py-[var(--space-3)]"
                        >
                          <p className="font-medium text-foreground">{suggestion.title}</p>
                          <p className="text-caption text-muted-foreground">
                            {suggestion.intent === "project" ? "Project" : "Task"} • Confidence {formatConfidence(suggestion.confidence)}
                            {scheduleText ? ` • ${scheduleText}` : ""}
                          </p>
                          {suggestion.summary && (
                            <p className="text-label text-muted-foreground">{suggestion.summary}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {assistantError && (
                  <p className="text-caption text-danger" role="alert">
                    {assistantError}
                  </p>
                )}
                {(assistantPlan?.safety.safeMode || assistantSafeMode?.active) && (
                  <p className="text-caption text-muted-foreground">
                    Safe mode is active. Suggestions are limited for additional safety.
                  </p>
                )}
                <Button
                  type="button"
                  variant="neo"
                  size="sm"
                  onClick={handleAskAssistant}
                  disabled={assistantLoading}
                  className="flex items-center gap-[var(--space-2)] rounded-full"
                >
                  {assistantLoading ? (
                    <>
                      <Loader2 className="size-[var(--space-4)] animate-spin" aria-hidden />
                      <span>Asking assistant…</span>
                    </>
                  ) : (
                    <>
                      <Bot className="size-[var(--space-4)]" aria-hidden />
                      <span>Ask planner assistant</span>
                    </>
                  )}
                </Button>
              </div>
              <p
                id={aiDisclosureId}
                className="text-caption text-muted-foreground"
                role="note"
              >
                Prefer manual control? Cancel closes the composer and dismisses these AI suggestions.
              </p>
            </section>
          )}
          {error && (
            <p className="text-label text-danger" role="alert">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-[var(--space-3)]">
            <Button
              type="button"
              variant="quiet"
              onClick={closeSheet}
              aria-describedby={showAiSuggestions ? aiDisclosureId : undefined}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" tone="primary">
              Save to planner
            </Button>
          </div>
        </form>
      </PlannerCreationDialog>
    </>
  );
}
