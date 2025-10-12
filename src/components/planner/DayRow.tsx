import * as React from "react";
import { DayCard } from "./DayCard";
import type { ISODate } from "./plannerTypes";

type DayRowProps = { iso: ISODate; isToday: boolean };

const DayRow = React.memo(
  function DayRow({ iso, isToday }: DayRowProps) {
    return (
      <li
        id={`day-${iso}`}
        aria-label={`Day ${iso}${isToday ? " (Today)" : ""}`}
        className="w-full scroll-m-[calc(var(--space-8)+var(--space-6))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={0}
      >
        <DayCard iso={iso} isToday={isToday} />
      </li>
    );
  },
  (a: Readonly<DayRowProps>, b: Readonly<DayRowProps>) =>
    a.iso === b.iso && a.isToday === b.isToday,
);
export { DayRow };
