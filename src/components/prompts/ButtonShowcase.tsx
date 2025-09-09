import * as React from "react";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";

export default function ButtonShowcase() {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button tone="primary">Primary tone</Button>
        <Button tone="accent">Accent tone</Button>
        <Button tone="info" variant="ghost">
          Info ghost
        </Button>
        <Button tone="danger" variant="primary">
          Danger primary
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </div>
  );
}

