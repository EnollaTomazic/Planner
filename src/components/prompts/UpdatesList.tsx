import * as React from "react";

const UPDATES: React.ReactNode[] = [
  <>
    Global styles are now modularized into <code>animations.css</code>,<code>overlays.css</code>, and
    <code>utilities.css</code>.
  </>,
  <>
    Control height token <code>--control-h</code> now snaps to 44px to align with the 4px spacing grid.
  </>,
  <>
    Buttons now default to the 40px <code>md</code> size and follow a 36/40/44px scale.
  </>,
  <>
    WeekPicker scrolls horizontally with snap points, showing 2–3 days at a time on smaller screens.
  </>,
  <>Review status dots blink to highlight wins and losses.</>,
  <>
    Hero dividers now use <code>var(--space-4)</code> top padding and tokenized side offsets via <code>var(--space-2)</code>.
  </>,
  <>
    IconButton adds a compact <code>xs</code> size.
  </>,
  <>DurationSelector active state uses accent color tokens.</>,
  <>
    Color gallery groups tokens into Aurora, Neutrals, and Accents palettes with tabs.
  </>,
];

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

