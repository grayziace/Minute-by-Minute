"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { formatDayHeading } from "@/lib/utils";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { HaloLoader } from "@/components/ui/HaloLoader";
import { useExperienceMode } from "@/lib/experience/mode";
import {
  filterEntriesForViewer,
  groupEntriesByDay,
} from "@/lib/entries-helpers";
import { chapterNumberForDay } from "@/lib/day-meta";

export function DaysPage() {
  const { isViewMode } = useExperienceMode();

  const entries = useLiveQuery(async () => {
    const all = await db.entries.orderBy("recordedAt").reverse().toArray();
    return filterEntriesForViewer(all, isViewMode);
  }, [isViewMode]);

  if (entries === undefined) {
    return (
      <StorybookShell>
        <HaloLoader label="Opening archive" />
      </StorybookShell>
    );
  }

  const dayMap = groupEntriesByDay(entries);
  const days = Array.from(dayMap.keys()).sort().reverse();
  const allDaysAsc = Array.from(dayMap.keys()).sort();

  return (
    <StorybookShell>
      <div className="days-index memory-appear">
        <header className="days-index__header">
          <h1 className="spread-title">Days</h1>
          <p className="spread-subtitle">
            {isViewMode
              ? "Chapters from the shared archive."
              : "Every day is a chapter. Tap any day to read and edit."}
          </p>
        </header>

        {days.length === 0 ? (
          <p className="days-index__empty">
            {isViewMode
              ? "The story hasn&apos;t started yet."
              : "Your book is blank — capture your first moment on Now."}
          </p>
        ) : (
          <ul className="days-index__list">
            {days.map((dateKey) => {
              const dayEntries = dayMap.get(dateKey) ?? [];
              const chapter = chapterNumberForDay(dateKey, allDaysAsc);
              const preview = dayEntries.find((e) => e.text)?.text?.slice(0, 80);
              return (
                <li key={dateKey}>
                  <Link href={`/days/${dateKey}`} className="days-index__card">
                    <span className="days-index__chapter">Chapter {chapter}</span>
                    <span className="days-index__date">
                      {formatDayHeading(`${dateKey}T12:00:00`)}
                    </span>
                    {preview && (
                      <span className="days-index__preview">{preview}</span>
                    )}
                    <span className="days-index__count">
                      {dayEntries.length} moment{dayEntries.length === 1 ? "" : "s"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </StorybookShell>
  );
}
