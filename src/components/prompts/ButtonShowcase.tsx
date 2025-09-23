import * as React from "react";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";

export default function ButtonShowcase() {
  return (
    <div className="mb-[var(--space-8)] space-y-[var(--space-4)]">
      <div className="flex flex-wrap gap-[var(--space-2)]">
        <Button tone="primary" variant="primary">
          Primary tone
        </Button>
        <Button tone="accent" variant="primary">
          Accent tone
        </Button>
        <Button tone="info" variant="ghost">
          Info ghost
        </Button>
        <Button tone="danger" variant="primary">
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

