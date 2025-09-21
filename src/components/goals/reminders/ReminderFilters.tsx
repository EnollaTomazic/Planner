"use client";

import * as React from "react";
import TabBar from "@/components/ui/layout/TabBar";
import SegmentedButton from "@/components/ui/primitives/SegmentedButton";
import { SlidersHorizontal, Pin, PinOff } from "lucide-react";
import { useReminders, Group, SourceFilter } from "./useReminders";

export default function ReminderFilters() {
  const {
    showGroups,
    groupTabs,
    group,
    setGroup,
    toggleFilters,
    showFilters,
    sourceTabs,
    source,
    setSource,
    onlyPinned,
    togglePinned,
  } = useReminders();

  return (
    <>
      {showGroups && (
        <TabBar
          items={groupTabs}
          value={group}
          onValueChange={(key) => setGroup(key as Group)}
          ariaLabel="Reminder group"
          size="md"
          align="between"
          className="overflow-x-auto"
          linkPanels={false}
          right={
            <SegmentedButton
              className="inline-flex items-center gap-[var(--space-1)]"
              onClick={toggleFilters}
              aria-expanded={showFilters}
              title="Filters"
              selected={showFilters}
            >
              <SlidersHorizontal className="icon-sm" aria-hidden />
              Filters
            </SegmentedButton>
          }
        />
      )}

      {showFilters && (
        <div className="flex flex-wrap items-center gap-[var(--space-4)] pl-[var(--space-1)]">
          <TabBar
            items={sourceTabs}
            value={source}
            onValueChange={(key) => setSource(key as SourceFilter)}
            ariaLabel="Reminder source filter"
            size="sm"
            linkPanels={false}
          />
          <SegmentedButton
            onClick={togglePinned}
            aria-pressed={onlyPinned}
            title="Pinned only"
            selected={onlyPinned}
          >
            {onlyPinned ? <PinOff className="mr-[var(--space-1)]" /> : <Pin className="mr-[var(--space-1)]" />}
            {onlyPinned ? "Pinned only" : "Any pin"}
          </SegmentedButton>
        </div>
      )}
    </>
  );
}

