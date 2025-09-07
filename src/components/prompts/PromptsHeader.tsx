"use client";

import * as React from "react";
import { Button, SearchBar } from "@/components/ui";

interface PromptsHeaderProps {
  count: number;
  query: string;
  onQueryChange: (value: string) => void;
  onSave: () => void;
  disabled: boolean;
}

export default function PromptsHeader({
  count,
  query,
  onQueryChange,
  onSave,
  disabled,
}: PromptsHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <h2 className="card-title">Prompts</h2>
        <span className="pill">{count} saved</span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-48 sm:w-64 md:w-80">
          <SearchBar
            value={query}
            onValueChange={onQueryChange}
            placeholder="Search prompts…"
          />
        </div>
        <Button variant="primary" onClick={onSave} disabled={disabled}>
          Save
        </Button>
      </div>
    </div>
  );
}

