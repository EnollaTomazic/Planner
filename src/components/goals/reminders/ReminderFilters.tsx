"use client";

import * as React from "react";
import { TabBar } from "@/components/ui/layout/TabBar";
import { SegmentedButton } from "@/components/ui/primitives/SegmentedButton";
import { Input } from "@/components/ui/primitives/Input";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, Pin, PinOff, Search } from "lucide-react";

import styles from "./ReminderFilters.module.css";
import { useReminders, Group, SourceFilter } from "./useReminders";

export function ReminderFilters() {
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
    query,
    setQuery,
  } = useReminders();

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.currentTarget.value);
    },
    [setQuery],
  );

  return (
    <div className={styles.root}>
      <div className={styles.primaryRow}>
        <div className={styles.searchShell}>
          <Search aria-hidden className={styles.searchIcon} />
          <Input
            aria-label="Search reminders"
            placeholder="Search reminders"
            value={query}
            onChange={handleSearchChange}
            indent
            height="md"
            className={cn("shadow-depth-soft", styles.searchInput)}
          />
        </div>

        <div className={styles.groupRow}>
          {showGroups ? (
            <TabBar
              items={groupTabs}
              value={group}
              onValueChange={(key) => setGroup(key as Group)}
              ariaLabel="Reminder group"
              size="md"
              align="start"
              className={styles.tabBar}
              tablistClassName={styles.tabList}
              variant="neo"
              linkPanels={false}
            />
          ) : null}

          <SegmentedButton
            className={cn("inline-flex items-center gap-[var(--space-2)]", styles.toggle)}
            onClick={toggleFilters}
            aria-expanded={showFilters}
            title="Filters"
            selected={showFilters}
          >
            <SlidersHorizontal className="icon-sm" aria-hidden />
            Filters
          </SegmentedButton>
        </div>
      </div>

      {showFilters ? (
        <div className={styles.secondaryRow}>
          <TabBar
            items={sourceTabs}
            value={source}
            onValueChange={(key) => setSource(key as SourceFilter)}
            ariaLabel="Reminder source filter"
            size="md"
            variant="neo"
            className={styles.secondaryTabs}
            tablistClassName={styles.tabList}
            linkPanels={false}
          />
          <SegmentedButton
            onClick={togglePinned}
            aria-pressed={onlyPinned}
            title="Pinned only"
            selected={onlyPinned}
            className={cn("inline-flex items-center gap-[var(--space-2)]", styles.pinButton)}
          >
            {onlyPinned ? <PinOff className="icon-sm" /> : <Pin className="icon-sm" />}
            {onlyPinned ? "Pinned only" : "Any pin"}
          </SegmentedButton>
        </div>
      ) : null}
    </div>
  );
}

