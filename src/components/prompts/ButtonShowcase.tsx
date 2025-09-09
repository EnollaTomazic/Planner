import * as React from "react";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";

export default function ButtonShowcase() {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Button tone="primary">Primary tone</Button>
      <Button tone="accent">Accent tone</Button>
      <Button tone="info" variant="ghost">
        Info ghost
      </Button>
      <Button tone="danger" variant="primary">
        Danger primary
      </Button>
      <Button disabled>Disabled</Button>
      <Button size="sm">
        <Plus />
        Add item
      </Button>
    </div>
  );
}

