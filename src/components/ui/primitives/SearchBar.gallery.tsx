import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery";
import { Button } from "@/components/ui";

import SearchBar from "./SearchBar";

function SearchBarGalleryPreview() {
  const [query, setQuery] = React.useState("Champion counters");
  const handleNoop = React.useCallback((_value: string) => {
    void _value;
  }, []);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <SearchBar
        value={query}
        onValueChange={setQuery}
        placeholder="Search components"
      />
      <SearchBar
        value=""
        onValueChange={handleNoop}
        label="Search library"
        placeholder="With label"
        right={<Button size="sm">Filters</Button>}
      />
      <SearchBar
        value="Disabled"
        onValueChange={handleNoop}
        placeholder="Disabled"
        disabled
      />
      <SearchBar
        value="Loading"
        onValueChange={handleNoop}
        placeholder="Loading"
        loading
      />
    </div>
  );
}

export default defineGallerySection({
  id: "inputs",
  entries: [
    {
      id: "search-bar",
      name: "SearchBar",
      description: "Debounced search input with optional label and slots",
      kind: "primitive",
      tags: ["search", "input"],
      props: [
        { name: "value", type: "string", required: true },
        { name: "onValueChange", type: "(value: string) => void" },
        { name: "placeholder", type: "string" },
        { name: "label", type: "React.ReactNode" },
        { name: "right", type: "React.ReactNode" },
        { name: "loading", type: "boolean", defaultValue: "false" },
        { name: "disabled", type: "boolean", defaultValue: "false" },
        { name: "variant", type: '"default" | "neo"', defaultValue: '"default"' },
      ],
      axes: [
        {
          id: "state",
          label: "State",
          type: "state",
          values: [
            { value: "Default" },
            { value: "With label" },
            { value: "Disabled" },
            { value: "Loading" },
          ],
        },
      ],
      preview: createGalleryPreview({
        id: "ui:search-bar:states",
        render: () => <SearchBarGalleryPreview />,
      }),
      code: `const [query, setQuery] = React.useState("Champion counters");
const handleNoop = React.useCallback((_value: string) => {}, []);

<SearchBar
  value={query}
  onValueChange={setQuery}
  placeholder="Search components"
/>
<SearchBar
  value=""
  onValueChange={handleNoop}
  label="Search library"
  placeholder="With label"
  right={<Button size="sm">Filters</Button>}
/>
<SearchBar
  value="Disabled"
  onValueChange={handleNoop}
  placeholder="Disabled"
  disabled
/>
<SearchBar
  value="Loading"
  onValueChange={handleNoop}
  placeholder="Loading"
  loading
/>`,
    },
  ],
});
