// src/components/goals/RemindersTab.tsx
"use client";

import * as React from "react";
import Image from "next/image";

import { SectionCard } from "@/components/ui/layout/SectionCard";
import { AvatarFrame } from "@/components/ui";
import { withBasePath } from "@/lib/utils";

import { ReminderFilters } from "./reminders/ReminderFilters";
import { ReminderList } from "./reminders/ReminderList";
import { ReminderQuickAddForm } from "./reminders/ReminderQuickAddForm";
import styles from "./RemindersTab.module.css";

const REMINDER_AVATAR_SRC = withBasePath("/hero_image.png");

export function RemindersTab() {
  return (
    <SectionCard variant="neo" className={styles.card}>
      <SectionCard.Header className={styles.header}>
        <div className={styles.hero}>
          <AvatarFrame
            size="sm"
            media={
              <Image
                src={REMINDER_AVATAR_SRC}
                alt="Planner avatar wearing a headset"
                fill
                sizes="96px"
                priority={false}
              />
            }
          />
          <div className={styles.heroCopy}>
            <p className="text-title font-semibold tracking-tight text-foreground" role="text">
              Reminders
            </p>
            <p className="text-label text-muted-foreground">
              Keep crisp cues ready for every session and glide through focus swaps.
            </p>
          </div>
        </div>
      </SectionCard.Header>
      <SectionCard.Body className={styles.body}>
        <div className={styles.controls}>
          <ReminderQuickAddForm />
          <ReminderFilters />
        </div>
        <ReminderList />
      </SectionCard.Body>
    </SectionCard>
  );
}
