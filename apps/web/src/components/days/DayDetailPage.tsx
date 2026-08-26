"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { HaloLoader } from "@/components/ui/HaloLoader";
import { EditableText } from "@/components/ui/EditableText";
import { MomentCard } from "@/components/moments/MomentCard";
import { useExperienceMode } from "@/lib/experience/mode";
import {
  filterEntriesForViewer,
  filterMediaForViewer,
  groupEntriesByDay,
} from "@/lib/entries-helpers";
import { chapterNumberForDay, useDayMeta } from "@/lib/day-meta";
import { StorySuggestionsPanel } from "@/components/days/StorySuggestionsPanel";
import { dayRange, formatDayHeading } from "@/lib/utils";
import type { MediaAsset } from "@/lib/types";

interface DayDetailPageProps {
  dateKey: string;
}

export function DayDetailPage({ dateKey }: DayDetailPageProps) {
  const { isViewMode, canEdit } = useExperienceMode();
  const { meta, save, markComplete } = useDayMeta(dateKey);
  const { start, end } = dayRange(dateKey);

  const allEntries = useLiveQuery(
    () => db.entries.orderBy("recordedAt").toArray(),
    [],
  );

  const dayEntries = useLiveQuery(async () => {
    const inDay = await db.entries
      .where("recordedAt")
      .between(start, end, true, true)
      .sortBy("recordedAt");
    return filterEntriesForViewer(inDay, isViewMode);
  }, [start, end, isViewMode]);

  const mediaByEntry = useLiveQuery(async () => {
    const all = await db.mediaAssets.toArray();
    const visible = filterMediaForViewer(all, isViewMode);
    const map = new Map<string, MediaAsset[]>();
    for (const m of visible) {
      if (!m.entryId) continue;
      const list = map.get(m.entryId) ?? [];
      list.push(m);
      map.set(m.entryId, list);
    }
    return map;
  }, [isViewMode]);

  if (dayEntries === undefined || allEntries === undefined) {
    return (
      <StorybookShell>
        <HaloLoader label="Opening day" />
      </StorybookShell>
    );
  }

  const dayMap = groupEntriesByDay(allEntries);
  const allDaysAsc = Array.from(dayMap.keys()).sort();
  const chapter = chapterNumberForDay(dateKey, allDaysAsc);
  const heading = formatDayHeading(`${dateKey}T12:00:00`);

  const prevDay = allDaysAsc.filter((d) => d < dateKey).pop();
  const nextDay = allDaysAsc.find((d) => d > dateKey);

  return (
    <StorybookShell>
      <div className="page-spread day-chapter memory-appear">
        <nav className="day-chapter__nav">
          <Link href="/days" className="day-chapter__back">
            ← All days
          </Link>
          <div className="day-chapter__pager">
            {prevDay ? (
              <Link href={`/days/${prevDay}`} className="day-chapter__page-link">
                ← {prevDay.split("-")[2]}
              </Link>
            ) : (
              <span />
            )}
            {nextDay ? (
              <Link href={`/days/${nextDay}`} className="day-chapter__page-link">
                {nextDay.split("-")[2]} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>

        <header className="day-chapter__header">
          <p className="day-chapter__label">Chapter {chapter}</p>
          <EditableText
            value={meta.title}
            onSave={(title) => save("title", title)}
            placeholder="Give this day a title…"
            className="day-chapter__title"
            as="h1"
          />
          <p className="day-chapter__date">{heading}</p>
        </header>

        {(canEdit || meta.summary) && (
          <section className="day-chapter__summary paper-note paper-note--taped">
            <p className="storybook-widget__title">Day in one sentence</p>
            <EditableText
              value={meta.summary}
              onSave={(summary) => save("summary", summary)}
              placeholder="Summarise the day…"
              className="text-sm text-[var(--ink-soft)]"
              multiline
            />
          </section>
        )}

        <div className="day-chapter__meta-row">
          {(canEdit || meta.feeling) && (
            <div className="day-chapter__meta-chip">
              <span className="storybook-widget__title">Feeling</span>
              <EditableText
                value={meta.feeling}
                onSave={(feeling) => save("feeling", feeling)}
                placeholder="strange but exciting"
                className="text-sm"
              />
            </div>
          )}
          {(canEdit || meta.remember) && (
            <div className="day-chapter__meta-chip">
              <span className="storybook-widget__title">Remember</span>
              <EditableText
                value={meta.remember}
                onSave={(remember) => save("remember", remember)}
                placeholder="What to keep…"
                className="text-sm"
                multiline
              />
            </div>
          )}
        </div>

        {canEdit && (
          <StorySuggestionsPanel
            dateKey={dateKey}
            meta={meta}
            entries={dayEntries}
            onMarkComplete={markComplete}
          />
        )}

        <section className="day-chapter__moments">
          {dayEntries.length === 0 && (
            <p className="day-chapter__empty">
              {isViewMode
                ? "Nothing shared from this day."
                : "A quiet day — capture something when you're ready."}
            </p>
          )}
          {dayEntries.map((entry, i) => {
            const media = mediaByEntry?.get(entry.id);
            const hasPhoto = media?.some((m) => m.mimeType.startsWith("image/"));
            const variant =
              i === 0 && hasPhoto ? "hero" : hasPhoto ? "photo" : "note";
            return (
              <MomentCard
                key={entry.id}
                entry={entry}
                media={media}
                variant={variant}
              />
            );
          })}
        </section>

        {canEdit && (
          <div className="day-chapter__capture edit-only">
            <Link href={`/add?date=${dateKey}`} className="storybook-widget__link">
              + Add to this day
            </Link>
          </div>
        )}
      </div>
    </StorybookShell>
  );
}
