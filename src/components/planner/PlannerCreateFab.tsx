"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import {
  Button,
  IconButton,
  Input,
  Label,
  Modal,
  NativeSelect,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatWeekDay, fromISODate, shortDate, toISODate } from "@/lib/date";
import {
  buildRecurringTemplates,
  parsePlannerPhrase,
  type PlannerRecurringTemplate,
} from "@/lib/scheduling";
import { useFocusDate } from "./useFocusDate";
import { usePlannerStore, usePlannerActions } from "./usePlannerStore";
import { useSelectedProject, useSelectedTask } from "./useSelection";

const NEW_PROJECT_OPTION = "__planner_new_project__";
const FAB_STATUS_ID = "planner-fab-status";

const formatTimeLabel = (time: string) => {
  const [hours, minutes] = time.split(":").map((segment) => Number.parseInt(segment, 10));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  const dt = new Date();
  dt.setHours(hours, minutes, 0, 0);
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(dt);
  } catch {
    return time;
  }
};

type PlannerCreateFabProps = {
  watchRef: React.RefObject<HTMLElement | null>;
  forceVisible?: boolean;
};

type CreationSummary = {
  occurrences: string[];
  description: string;
};

export default function PlannerCreateFab({
  watchRef,
  forceVisible = false,
}: PlannerCreateFabProps) {
  const { iso } = useFocusDate();
  const baseDate = React.useMemo(() => fromISODate(iso) ?? new Date(), [iso]);

  const { day, getDay } = usePlannerStore();
  const { createProject, createTask } = usePlannerActions();
  const [selectedProjectId, setSelectedProjectId] = useSelectedProject(iso);
  const [, setSelectedTaskId] = useSelectedTask(iso);

  const [visible, setVisible] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [phrase, setPhrase] = React.useState("");
  const [projectOption, setProjectOption] = React.useState<string>(
    () => selectedProjectId || NEW_PROJECT_OPTION,
  );
  const [projectName, setProjectName] = React.useState("");
  const [projectNameEdited, setProjectNameEdited] = React.useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const headingId = React.useId();
  const descriptionId = React.useId();
  const phraseFieldId = React.useId();
  const projectSelectId = React.useId();
  const projectNameId = React.useId();
  const summaryId = React.useId();

  const watchedElement = watchRef.current;
  const supportsIntersectionObserver =
    typeof window !== "undefined" && "IntersectionObserver" in window;

  React.useEffect(() => {
    if (watchedElement !== undefined && watchedElement !== null) {
      setVisible(!supportsIntersectionObserver);
    }
  }, [supportsIntersectionObserver, watchedElement]);

  React.useEffect(() => {
    if (watchedElement !== null && watchedElement !== undefined) {
      return;
    }
    setVisible(true);
  }, [watchedElement]);

  React.useEffect(() => {
    if (!supportsIntersectionObserver) {
      setVisible(true);
      return;
    }
    if (!watchedElement) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        setVisible(!entry.isIntersecting);
      }
    });

    observer.observe(watchedElement);

    return () => {
      observer.disconnect();
    };
  }, [supportsIntersectionObserver, watchedElement]);

  const projects = React.useMemo(() => day.projects ?? [], [day.projects]);

  React.useEffect(() => {
    if (projectOption !== NEW_PROJECT_OPTION) {
      const stillExists = projects.some((project) => project.id === projectOption);
      if (!stillExists) {
        setProjectOption(NEW_PROJECT_OPTION);
      }
    }
  }, [projectOption, projects]);

  const parseResult = React.useMemo(() => {
    if (!phrase.trim()) return null;
    return parsePlannerPhrase(phrase, {
      referenceDate: baseDate,
      fallbackISO: iso,
    });
  }, [phrase, baseDate, iso]);

  React.useEffect(() => {
    if (!open) return;
    if (!projectNameEdited && parseResult?.title) {
      setProjectName(parseResult.title);
    }
  }, [open, parseResult?.title, projectNameEdited]);

  React.useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [open]);

  React.useEffect(() => {
    setSelectedTemplateId(null);
  }, [phrase]);

  const templates = React.useMemo<PlannerRecurringTemplate[]>(() => {
    if (!parseResult) return [];
    return buildRecurringTemplates(parseResult);
  }, [parseResult]);

  const activeOccurrences = React.useMemo(() => {
    if (selectedTemplateId) {
      const template = templates.find((entry) => entry.id === selectedTemplateId);
      if (template) return Array.from(new Set(template.occurrences));
    }
    if (parseResult?.occurrences?.length) {
      return Array.from(new Set([parseResult.occurrences[0]!])) ?? [];
    }
    return [iso];
  }, [parseResult, templates, selectedTemplateId, iso]);

  const summary: CreationSummary | null = React.useMemo(() => {
    if (!parseResult) {
      return {
        occurrences: activeOccurrences,
        description: `Will create on ${formatWeekDay(activeOccurrences[0] ?? iso)}.`,
      };
    }
    const formattedDates = activeOccurrences.map((occurrence) => {
      try {
        const label = formatWeekDay(occurrence);
        const longLabel = shortDate.format(fromISODate(occurrence) ?? new Date());
        return `${label} (${longLabel})`;
      } catch {
        return occurrence;
      }
    });
    const timeLabel = parseResult.time ? ` at ${formatTimeLabel(parseResult.time)}` : "";
    const recurrenceText = parseResult.recurrence ? " • Recurring" : "";
    return {
      occurrences: activeOccurrences,
      description: `${formattedDates.join(", ")}${timeLabel}${recurrenceText}`,
    };
  }, [activeOccurrences, iso, parseResult]);

  const handleOpen = React.useCallback(() => {
    setStatusMessage(null);
    setPhrase("");
    setProjectName("");
    setProjectNameEdited(false);
    setSelectedTemplateId(null);
    setProjectOption(selectedProjectId || NEW_PROJECT_OPTION);
    setOpen(true);
  }, [selectedProjectId]);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setPhrase("");
    setProjectName("");
    setProjectNameEdited(false);
    setSelectedTemplateId(null);
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const trimmed = phrase.trim();
    if (!trimmed) {
      setStatusMessage("Add a short description before creating a plan.");
      return;
    }
    const parsed =
      parseResult ??
      parsePlannerPhrase(trimmed, { referenceDate: baseDate, fallbackISO: iso });
    if (!parsed) {
      setStatusMessage("Could not understand the phrase. Try adding a date or action.");
      return;
    }
    const occurrences = activeOccurrences.length
      ? activeOccurrences
      : [parsed.startDate];
    setSubmitting(true);
    try {
      const title = parsed.title || trimmed;
      const baseProject =
        projectOption === NEW_PROJECT_OPTION
          ? null
          : projects.find((project) => project.id === projectOption) ?? null;
      const fallbackProjectName = projectName.trim() || title;
      const baseProjectName = baseProject?.name ?? fallbackProjectName;
      const projectLabel =
        projectOption === NEW_PROJECT_OPTION ? fallbackProjectName : baseProjectName;

      let createdCount = 0;

      for (const occurrence of occurrences) {
        const projectIso = toISODate(occurrence);
        let targetProjectId: string | undefined;
        if (projectOption === NEW_PROJECT_OPTION) {
          const createdProjectId = createProject({
            iso: projectIso,
            name: projectLabel,
            select: projectIso === iso ? setSelectedProjectId : undefined,
          });
          targetProjectId = createdProjectId;
        } else if (projectIso === iso) {
          targetProjectId = projectOption;
        } else {
          const dayRecord = getDay(projectIso);
          const matchingProject = dayRecord.projects.find(
            (project) => project.name === baseProjectName,
          );
          if (matchingProject) {
            targetProjectId = matchingProject.id;
          } else {
            targetProjectId = createProject({
              iso: projectIso,
              name: baseProjectName,
            });
          }
        }

        if (!targetProjectId) {
          // Skip if we could not ensure a project exists for the day.
          continue;
        }

        const createdTaskId = createTask({
          iso: projectIso,
          projectId: targetProjectId,
          title,
          select: projectIso === iso ? setSelectedTaskId : undefined,
        });

        if (createdTaskId) {
          createdCount += 1;
        }
      }

      if (createdCount > 0) {
        const occurrencesText = createdCount === 1 ? "task" : "tasks";
        setStatusMessage(`Added ${createdCount} ${occurrencesText} from the planner sheet.`);
        handleClose();
      } else {
        setStatusMessage("Nothing was created. Check your project selection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleShortcutKey: React.KeyboardEventHandler<HTMLFormElement> = (
    event,
  ) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const projectItems = React.useMemo(
    () => [
      { value: NEW_PROJECT_OPTION, label: "Create new project" },
      ...projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    ],
    [projects],
  );

  if (!visible && !forceVisible && !open) {
    return (
      statusMessage && (
        <p id={FAB_STATUS_ID} className="sr-only" role="status" aria-live="polite">
          {statusMessage}
        </p>
      )
    );
  }

  return (
    <>
      <IconButton
        aria-label="Create planner item"
        size="xl"
        variant="primary"
        tone="accent"
        className="fixed bottom-[var(--space-8)] right-[max(var(--space-2),calc((var(--viewport-width) - var(--shell-max, var(--shell-width))) / 2 + var(--space-2)))] z-50 rounded-full shadow-[var(--shadow-neo-soft)]"
        onClick={handleOpen}
      >
        <Plus />
      </IconButton>

      {statusMessage && (
        <p id={FAB_STATUS_ID} className="sr-only" role="status" aria-live="polite">
          {statusMessage}
        </p>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        className="card-neo-soft card-pad w-full max-w-[min(90vw,calc(var(--space-16)*10))] space-y-[var(--space-5)] shadow-[var(--shadow-neo-soft)]"
      >
        <form
          ref={formRef}
          className="space-y-[var(--space-5)]"
          onSubmit={handleSubmit}
          onKeyDown={handleShortcutKey}
          aria-describedby={summary ? summaryId : undefined}
        >
          <header className="space-y-[var(--space-2)]">
            <h2
              id={headingId}
              className="text-title-lg font-semibold tracking-[-0.01em] text-foreground"
            >
              Quick planner entry
            </h2>
            <p
              id={descriptionId}
              className="text-ui text-muted-foreground"
            >
              Describe what you want to schedule. For example, “Daily standup at 9am” or
              “Plan sprint tomorrow afternoon”.
            </p>
          </header>

          <div className="space-y-[var(--space-2)]">
            <Label htmlFor={phraseFieldId}>Plan details</Label>
            <Input
              id={phraseFieldId}
              ref={inputRef}
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              placeholder="What should we plan?"
              aria-describedby={summary ? summaryId : undefined}
              autoComplete="off"
              height="lg"
            />
            {summary && (
              <p
                id={summaryId}
                className="text-label text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {summary.description}
              </p>
            )}
          </div>

          <div className="space-y-[var(--space-2)]">
            <Label htmlFor={projectSelectId}>Project destination</Label>
            <NativeSelect
              id={projectSelectId}
              items={projectItems}
              value={projectOption}
              onChange={(value) => {
                setProjectOption(value);
                setProjectNameEdited(false);
              }}
            />
            {projectOption === NEW_PROJECT_OPTION && (
              <div className="space-y-[var(--space-1)]">
                <Label htmlFor={projectNameId} className="text-label text-muted-foreground">
                  Project name
                </Label>
                <Input
                  id={projectNameId}
                  value={projectName}
                  onChange={(event) => {
                    setProjectName(event.target.value);
                    setProjectNameEdited(true);
                  }}
                  placeholder="e.g. Daily standup"
                />
              </div>
            )}
          </div>

          {templates.length > 0 && (
            <div className="space-y-[var(--space-2)]">
              <p className="text-label font-medium text-muted-foreground">
                Recurring templates
              </p>
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    size="sm"
                    variant={selectedTemplateId === template.id ? "primary" : "secondary"}
                    tone={selectedTemplateId === template.id ? "accent" : "info"}
                    className={cn(
                      "rounded-full",
                      selectedTemplateId === template.id
                        ? "shadow-[var(--btn-primary-shadow-hover)]"
                        : "shadow-[var(--shadow-neo-soft)]",
                    )}
                    aria-pressed={selectedTemplateId === template.id}
                    onClick={() =>
                      setSelectedTemplateId((current) =>
                        current === template.id ? null : template.id,
                      )
                    }
                  >
                    <span className="text-ui font-medium">{template.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-[var(--space-2)]">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" tone="accent" loading={submitting}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
