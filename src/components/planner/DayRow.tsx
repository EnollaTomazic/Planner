import * as React from "react";
import DayCard from "./DayCard";
import type { ISODate } from "./plannerStore";

type DayRowProps = { iso: ISODate; isToday: boolean };

const DayRow = React.memo(
  function DayRow({ iso, isToday }: DayRowProps) {
    return (
      <section
        id={`day-${iso}`}
        role="listitem"
        aria-label={`Day ${iso}${isToday ? " (Today)" : ""}`}
        className="w-full scroll-m-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={-1}
      >
        <DayCard iso={iso} isToday={isToday} />
      </section>
    );
  },
  (a: Readonly<DayRowProps>, b: Readonly<DayRowProps>) =>
    a.iso === b.iso && a.isToday === b.isToday,
);

export default DayRow;
