export type ComponentIssueSeverity = "low" | "medium" | "high";
export type ComponentIssueStatus = "open" | "in-progress" | "blocked" | "resolved";

export interface ComponentIssue {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly severity: ComponentIssueSeverity;
  readonly status: ComponentIssueStatus;
  readonly link?: string;
}

const COMPONENT_ISSUES: Record<string, readonly ComponentIssue[]> = {
  "segmented-button": [
    {
      id: "segmented-button-remove-isactive",
      title: "Remove deprecated `isActive` alias",
      summary:
        "SegmentedButton still accepts the legacy `isActive` prop. Drop the alias once consuming surfaces migrate to `selected` to keep the API tight.",
      severity: "medium",
      status: "resolved",
    },
  ],
  header: [
    {
      id: "header-clean-rail-props",
      title: "Remove no-op rail props",
      summary:
        "Header keeps the old rail props as inert placeholders for backward compatibility. Remove them when downstream layouts finish swapping to the hero frame.",
      severity: "low",
      status: "open",
    },
  ],
  hero: [
    {
      id: "hero-tabs-alias-cleanup",
      title: "Retire the deprecated `tabs` alias",
      summary:
        "Hero exposes the historical `tabs` prop alongside `subTabs`. Once legacy consumers migrate, drop the alias to reduce bundle weight and confusion.",
      severity: "low",
      status: "open",
    },
  ],
};

export function getComponentIssues(entryId: string): readonly ComponentIssue[] {
  return COMPONENT_ISSUES[entryId] ?? [];
}

