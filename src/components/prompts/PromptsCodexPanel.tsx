"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";

interface CodePrompt {
  id: string;
  title: string;
  focus: string;
  description: string;
  body: string;
}

const CODEX_PROMPTS: CodePrompt[] = [
  {
    id: "risk-audit",
    title: "Risk audit",
    focus: "Safety",
    description: "Surface regressions and side-effects that could impact live traffic.",
    body:
      "Review this diff for hidden risks. Highlight database or caching changes, concurrency edge cases, and failure recovery paths. Flag any migrations that need rollback plans and confirm metrics or feature flags that should be monitored after deploy.",
  },
  {
    id: "context-brief",
    title: "Context brief",
    focus: "Clarity",
    description: "Summarize intent, reviewers, and testing requirements before handoff.",
    body:
      "Summarize this change for a teammate stepping in cold. Explain the problem it solves, the scope of files touched, and tests that must pass before merge. Call out reviewers best suited for the diff and dependencies that should release alongside it.",
  },
  {
    id: "refactor-plan",
    title: "Refactor checklist",
    focus: "Maintainability",
    description: "Ensure the code stays approachable after large structural updates.",
    body:
      "Draft a refactor plan for this diff. Identify modules that grew in complexity, functions that should be extracted, and opportunities for stronger typing. Suggest follow-up tasks to improve observability and documentation once the change lands.",
  },
];

export default function PromptsCodexPanel() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleCopy = React.useCallback((prompt: CodePrompt) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    navigator.clipboard
      .writeText(prompt.body)
      .then(() => {
        setCopiedId(prompt.id);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setCopiedId((prev) => (prev === prompt.id ? null : prev));
        }, 2000);
      })
      .catch(() => {
        setCopiedId(null);
      });
  }, []);

  return (
    <Card className="space-y-[var(--space-4)]">
      <CardHeader>
        <CardTitle>Codex review prompts</CardTitle>
        <CardDescription>
          Reuse focused checklists when shipping risky diffs or large refactors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[var(--space-3)]">
        {CODEX_PROMPTS.map((prompt) => (
          <Card key={prompt.id} asChild>
            <article className="flex flex-col gap-[var(--space-3)]">
              <header className="flex flex-wrap items-start justify-between gap-[var(--space-2)]">
                <div>
                  <CardTitle className="text-ui font-semibold">
                    {prompt.title}
                  </CardTitle>
                  <CardDescription>{prompt.description}</CardDescription>
                </div>
                <Badge size="xs" tone="accent">
                  {prompt.focus}
                </Badge>
              </header>
              <p className="text-ui text-muted-foreground">{prompt.body}</p>
              <div className="flex items-center justify-end gap-[var(--space-2)]">
                {copiedId === prompt.id ? (
                  <Badge size="xs" tone="accent">
                    Copied
                  </Badge>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="border border-border/30 bg-transparent hover:bg-accent/15"
                  onClick={() => handleCopy(prompt)}
                >
                  Copy prompt
                </Button>
              </div>
            </article>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
