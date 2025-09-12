import * as React from "react";
import { Select } from "@/components/ui";

const items = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
];

export default function SelectShowcase() {
  const [value, setValue] = React.useState<string>();
  return (
    <div className="flex flex-col gap-4">
      <Select items={items} value={value} onChange={setValue} placeholder="Animated" />
      <Select variant="native" items={items} value={value} onChange={setValue} />
      <Select items={items} disabled placeholder="Disabled" />
    </div>
  );
}
