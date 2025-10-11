import * as React from "react";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";

export function ButtonShowcase() {
  return (
    <div className="mb-[var(--space-8)] space-y-[var(--space-4)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        <Button tone="primary" variant="default">
          Primary tone
        </Button>
        <Button tone="accent" variant="default">
          Accent tone
        </Button>
        <Button tone="info" variant="quiet">
          Info quiet
        </Button>
        <Button tone="danger" variant="default">
          Danger primary
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-[var(--space-2)]">
        <Button size="sm">
          <Plus />
          Small
        </Button>
        <Button size="md">
          <Plus />
          Medium
        </Button>
        <Button size="lg">
          <Plus />
          Large
        </Button>
        <Button size="xl">
          <Plus />
          Extra large
        </Button>
      </div>
    </div>
  );
}

