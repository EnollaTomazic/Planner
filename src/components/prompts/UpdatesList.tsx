import * as React from "react";
import { UPDATES } from "./demoData";

export default function UpdatesList() {
  return (
    <ul className="mb-4 space-y-4">
      {UPDATES.map((content, i) => (
        <li key={i} className="text-sm text-muted-foreground">
          {content}
        </li>
      ))}
    </ul>
  );
}

