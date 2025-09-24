"use client";

import * as React from "react";

import { createGalleryPreview, defineGallerySection } from "@/components/gallery/registry";
import { Button } from "@/components/ui";

import SearchBar from "./SearchBar";

type SearchBarStateHelpers = {
  interactiveValue: string;
  onInteractiveChange: (value: string) => void;
  noop: (value: string) => void;
  renderFiltersButton: () => React.ReactNode;
};

type SearchBarStateSpec = {
  id: string;
  name: string;
  getProps: (
    helpers: SearchBarStateHelpers,
  ) => React.ComponentProps<typeof SearchBar>;
  code?: string;
};

const SEARCH_BAR_NOOP = (value: string) => {
  void value;
};

const SEARCH_BAR_STATES: readonly SearchBarStateSpec[] = [
  {
    id: "default",
    name: "Default",
    getProps: ({ interactiveValue, onInteractiveChange }) => ({
      value: interactiveValue,
      onValueChange: onInteractiveChange,
      placeholder: "Search components",
    }),
    code: "<SearchBar value={query} onValueChange={setQuery} placeholder=\"Search components\" />",
  },
  {
    id: "with-label",
    name: "With label",
    getProps: ({ noop, renderFiltersButton }) => ({
      value: "",
      onValueChange: noop,
      label: "Search library",
      placeholder: "With label",
      right: renderFiltersButton(),
    }),
    code: "<SearchBar label=\"Search library\" right={<Button size=\"sm\">Filters</Button>} />",
  },
  {
    id: "hover",
    name: "Hover",
    getProps: ({ noop }) => ({
      value: "Hover",
      onValueChange: noop,
      placeholder: "Hover",
      fieldClassName: "bg-[--hover]",
    }),
    code: "<SearchBar fieldClassName=\"bg-[--hover]\" placeholder=\"Hover\" />",
  },
  {
    id: "focus-visible",
    name: "Focus-visible",
    getProps: ({ noop }) => ({
      value: "Focus-visible",
      onValueChange: noop,
      placeholder: "Focus-visible",
      fieldClassName:
        "ring-2 ring-[hsl(var(--ring))] ring-offset-0 ring-offset-[hsl(var(--bg))]",
    }),
    code: "<SearchBar fieldClassName=\"ring-2 ring-[hsl(var(--ring))] ring-offset-0 ring-offset-[hsl(var(--bg))]\" placeholder=\"Focus-visible\" />",
  },
  {
    id: "active",
    name: "Active",
    getProps: ({ noop }) => ({
      value: "Active",
      onValueChange: noop,
      placeholder: "Active",
      fieldClassName: "bg-[--active]",
    }),
    code: "<SearchBar fieldClassName=\"bg-[--active]\" placeholder=\"Active\" />",
  },
  {
    id: "disabled",
    name: "Disabled",
    getProps: ({ noop }) => ({
      value: "Disabled",
      onValueChange: noop,
      placeholder: "Disabled",
      disabled: true,
    }),
    code: "<SearchBar placeholder=\"Disabled\" disabled />",
  },
  {
    id: "loading",
    name: "Loading",
    getProps: ({ noop }) => ({
      value: "Loading",
      onValueChange: noop,
      placeholder: "Loading",
      loading: true,
    }),
    code: "<SearchBar placeholder=\"Loading\" loading />",
  },
];

function SearchBarStatePreview({
  state,
  helpers,
}: {
  state: SearchBarStateSpec;
  helpers: SearchBarStateHelpers;
}) {
  const props = state.getProps(helpers);
  return <SearchBar {...props} />;
}

function SearchBarGalleryPreview() {
  const [query, setQuery] = React.useState("Champion counters");
  const renderFiltersButton = React.useCallback(
    () => <Button size="sm">Filters</Button>,
    [],
  );
  const helpers = React.useMemo(
    () => ({
      interactiveValue: query,
      onInteractiveChange: setQuery,
      noop: SEARCH_BAR_NOOP,
      renderFiltersButton,
    }),
    [query, renderFiltersButton, setQuery],
  );

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {SEARCH_BAR_STATES.map((state) => (
        <SearchBarStatePreview key={state.id} state={state} helpers={helpers} />
      ))}
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
          values: SEARCH_BAR_STATES.map(({ name }) => ({ value: name })),
        },
      ],
      preview: createGalleryPreview({
        id: "ui:search-bar:states",
        render: () => <SearchBarGalleryPreview />,
      }),
      states: SEARCH_BAR_STATES.map((state) => ({
        id: state.id,
        name: state.name,
        code: state.code,
        preview: createGalleryPreview({
          id: `ui:search-bar:state:${state.id}`,
          render: () => (
            <SearchBarStatePreview
              state={state}
              helpers={{
                interactiveValue: "Champion counters",
                onInteractiveChange: SEARCH_BAR_NOOP,
                noop: SEARCH_BAR_NOOP,
                renderFiltersButton: () => <Button size="sm">Filters</Button>,
              }}
            />
          ),
        }),
      })),
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
  value="Hover"
  onValueChange={handleNoop}
  placeholder="Hover"
  fieldClassName="bg-[--hover]"
/>
<SearchBar
  value="Focus-visible"
  onValueChange={handleNoop}
  placeholder="Focus-visible"
  fieldClassName="ring-2 ring-[hsl(var(--ring))] ring-offset-0 ring-offset-[hsl(var(--bg))]"
/>
<SearchBar
  value="Active"
  onValueChange={handleNoop}
  placeholder="Active"
  fieldClassName="bg-[--active]"
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
