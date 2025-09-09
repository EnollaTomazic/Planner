import * as React from "react";
import { IconButton } from "@/components/ui";
import { Plus } from "lucide-react";

export default function IconButtonShowcase() {
  return (
    <div className="mb-8 flex gap-2">
      <IconButton size="xs" aria-label="Add item xs" title="Add item xs">
        <Plus size={16} aria-hidden />
      </IconButton>
      <IconButton aria-label="Add item" title="Add item">
        <Plus size={16} aria-hidden />
      </IconButton>
      <IconButton variant="glow" aria-label="Add item glow" title="Add item glow">
        <Plus size={16} aria-hidden />
      </IconButton>
    </div>
  );
}

