"use client";

import * as React from "react";
import { Focus, Keyboard } from "lucide-react";

import { Badge, Button, useDialogTrap } from "@/components/ui";
import { cn } from "@/lib/utils";

const FLOW_STEPS = [
  {
    id: "scope",
    title: "Scope the surface",
    description: "Review aria landmarks, region labels, and dynamic announcements.",
  },
  {
    id: "wire",
    title: "Wire keyboard loops",
    description: "Decide when tab, shift+tab, or arrow keys should cycle focus.",
  },
  {
    id: "test",
    title: "Test with screen readers",
    description: "Verify announcements, rotor navigation, and structural order.",
  },
  {
    id: "ship",
    title: "Document the pattern",
    description: "Share the final keyboard map with QA and design reviewers.",
  },
] as const;

export default function A11yPreviewClient() {
  return (
    <div className="space-y-[var(--space-6)]">
      <FocusTrapDemo />
      <KeyboardFlowDemo />
    </div>
  );
}

function FocusTrapDemo() {
  const [open, setOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const liveRef = React.useRef<HTMLDivElement>(null);

  useDialogTrap({
    open,
    onClose: () => setOpen(false),
    ref: dialogRef,
  });

  React.useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = open
        ? "Focus trap engaged. Press Escape to close the dialog."
        : "Dialog closed. Focus returned to the trigger.";
    }
  }, [open]);

  return (
    <section aria-labelledby="a11y-focus-heading" className="space-y-[var(--space-4)]" data-a11y-panel="trap">
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          <h2 id="a11y-focus-heading" className="text-heading-sm font-semibold tracking-[-0.01em]">
            Dialog focus trap
          </h2>
          <p className="max-w-3xl text-label text-muted-foreground">
            The modal keeps keyboard focus inside until dismissed. Escape and the close button both release focus and
            restore the trigger for predictable return journeys.
          </p>
        </div>
        <Badge tone={open ? "accent" : "neutral"} className="flex items-center gap-[var(--space-2)] uppercase tracking-[0.12em]">
          <Focus className="h-[var(--space-4)] w-[var(--space-4)]" aria-hidden="true" />
          {open ? "Trap active" : "Trap idle"}
        </Badge>
      </header>
      <div className="flex flex-wrap items-center gap-[var(--space-3)] text-ui">
        <Button onClick={() => setOpen(true)} variant="default">
          Launch focus trap
        </Button>
        <p className="text-label text-muted-foreground">
          Tab forward/backward cycles elements. Arrow keys stay scoped to composite widgets inside the dialog.
        </p>
      </div>
      <div aria-live="polite" className="sr-only" ref={liveRef} />
      {open ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 p-[var(--space-4)] backdrop-blur-md"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-dialog-title"
            aria-describedby="a11y-dialog-description"
            className="w-full max-w-lg space-y-[var(--space-5)] rounded-card bg-card p-[var(--space-5)] text-card-foreground shadow-depth-soft"
          >
            <header className="space-y-[var(--space-2)]">
              <p className="text-caption font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Session prep
              </p>
              <h3 id="a11y-dialog-title" className="text-heading-sm font-semibold tracking-[-0.01em]">
                Keyboard loop checklist
              </h3>
              <p id="a11y-dialog-description" className="text-label text-muted-foreground">
                Confirm each modal control is focusable, labelled, and reachable via keyboard. Finish to hand the tray
                back to the calling surface.
              </p>
            </header>
            <form
              className="space-y-[var(--space-4)]"
              aria-describedby="a11y-dialog-description"
              onSubmit={(event) => {
                event.preventDefault();
                setOpen(false);
              }}
            >
              <fieldset className="space-y-[var(--space-2)]">
                <legend className="text-label font-medium text-foreground">Quick audit</legend>
                <label className="flex items-center gap-[var(--space-2)] text-label text-muted-foreground">
                  <input type="checkbox" defaultChecked className="h-[var(--space-4)] w-[var(--space-4)] accent-[hsl(var(--accent))]" />
                  Focus trap engages when opened
                </label>
                <label className="flex items-center gap-[var(--space-2)] text-label text-muted-foreground">
                  <input type="checkbox" defaultChecked className="h-[var(--space-4)] w-[var(--space-4)] accent-[hsl(var(--accent))]" />
                  Escape closes without side effects
                </label>
                <label className="flex items-center gap-[var(--space-2)] text-label text-muted-foreground">
                  <input type="checkbox" className="h-[var(--space-4)] w-[var(--space-4)] accent-[hsl(var(--accent))]" />
                  First focus lands on the dialog heading
                </label>
              </fieldset>
              <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                <Button type="button" variant="neo" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  Mark checklist complete
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function KeyboardFlowDemo() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [completedIds, setCompletedIds] = React.useState<Set<string>>(() => new Set());
  const containerRef = React.useRef<HTMLDivElement>(null);
  const liveRef = React.useRef<HTMLDivElement>(null);

  const announce = React.useCallback((message: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
    }
  }, []);

  React.useEffect(() => {
    const step = FLOW_STEPS[activeIndex];
    announce(`Focused ${step.title}. ${step.description}`);
  }, [activeIndex, announce]);

  const toggleCompleted = React.useCallback(
    (id: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        announce(`${next.has(id) ? "Marked" : "Unmarked"} ${id} as complete.`);
        return next;
      });
    },
    [announce],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % FLOW_STEPS.length);
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + FLOW_STEPS.length) % FLOW_STEPS.length);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setActiveIndex(FLOW_STEPS.length - 1);
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        const id = FLOW_STEPS[activeIndex]?.id;
        if (id) {
          toggleCompleted(id);
        }
      }
    },
    [activeIndex, toggleCompleted],
  );

  return (
    <section aria-labelledby="a11y-flow-heading" className="space-y-[var(--space-4)]" data-a11y-panel="keyboard-flow">
      <header className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <div className="space-y-[var(--space-1)]">
          <h2 id="a11y-flow-heading" className="text-heading-sm font-semibold tracking-[-0.01em]">
            Keyboard flow planner
          </h2>
          <p className="max-w-3xl text-label text-muted-foreground">
            Roving tab index ensures arrow keys move between steps while Tab exits the widget. Space marks milestones as
            complete without stealing focus.
          </p>
        </div>
        <Badge tone="accent" className="flex items-center gap-[var(--space-2)] uppercase tracking-[0.12em]">
          <Keyboard className="h-[var(--space-4)] w-[var(--space-4)]" aria-hidden="true" />
          Arrow navigable
        </Badge>
      </header>
      <div className="sr-only" aria-live="polite" ref={liveRef} />
      <div
        role="listbox"
        aria-label="Keyboard flow checkpoints"
        ref={containerRef}
        tabIndex={-1}
        className="grid gap-[var(--space-3)]"
        onKeyDown={handleKeyDown}
      >
        {FLOW_STEPS.map((step, index) => {
          const selected = index === activeIndex;
          const completed = completedIds.has(step.id);
          const handleFocus = () => setActiveIndex(index);
          return (
            <button
              key={step.id}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              data-completed={completed ? "true" : undefined}
              onFocus={handleFocus}
              onClick={() => toggleCompleted(step.id)}
              className={cn(
                "flex w-full flex-col gap-[var(--space-2)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]",
                selected ? "border-accent shadow-depth-soft" : "border-card-hairline-60 bg-surface/60",
              )}
            >
              <div className="flex items-center justify-between gap-[var(--space-3)]">
                <span className="text-body font-semibold text-foreground">{step.title}</span>
                <span
                  className={cn(
                    "text-caption uppercase tracking-[0.12em]",
                    completed ? "text-accent" : "text-muted-foreground",
                  )}
                >
                  {completed ? "Complete" : "Pending"}
                </span>
              </div>
              <span className="text-label text-muted-foreground">{step.description}</span>
              <span className="sr-only">{completed ? "Step marked complete" : "Step pending"}</span>
            </button>
          );
        })}
      </div>
      <p className="text-label text-muted-foreground">
        Tip: Press Home or End to jump to the first or last milestone. Tab moves focus out of the listbox.
      </p>
    </section>
  );
}
