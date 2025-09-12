"use client";

import * as React from "react";
import { Button, SearchBar } from "@/components/ui";
import Badge from "@/components/ui/primitives/Badge";

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
  const [localQuery, setLocalQuery] = React.useState(query);
  const debounceRef = React.useRef<number>();

  React.useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  React.useEffect(() => {
    return () => {
      window.clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = React.useCallback(
    (val: string) => {
      setLocalQuery(val);
      window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => onQueryChange(val), 300);
    },
    [onQueryChange],
  );

  const handleChip = (chip: string) => {
    setLocalQuery(chip);
    onQueryChange(chip);
  };

  const chips = ["hover", "focus", "active", "disabled", "loading"];

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <h2 className="card-title">Prompts</h2>
        <span className="pill">{count} saved</span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-48 sm:w-64 md:w-80">
          <SearchBar
            value={localQuery}
            onValueChange={handleChange}
            placeholder="Search prompts…"
            debounceMs={0}
          />
        </div>
        <div className="hidden sm:flex gap-1">
          {chips.map((c) => (
            <Badge key={c} interactive onClick={() => handleChip(c)}>
              {c}
            </Badge>
          ))}
        </div>
        <Button variant="primary" onClick={onSave} disabled={disabled}>
          Save
        </Button>
      </div>
    </div>
  );
}

