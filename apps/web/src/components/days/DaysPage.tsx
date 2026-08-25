"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { formatDayHeading, toDateKey, formatTime } from "@/lib/utils";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { HaloLoader } from "@/components/ui/HaloLoader";
import { EditableText } from "@/components/ui/EditableText";
import { useExperienceMode } from "@/lib/experience/mode";
import type { MediaAsset } from "@/lib/types";

async function updateEntry(
  id: string,
  patch: Partial<{ text: string; locationName: string; moodNote: string }>,
) {
  await db.entries.update(id, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export function DaysPage() {
  const { isViewMode } = useExperienceMode();

  const entries = useLiveQuery(async () => {
    const all = await db.entries.orderBy("recordedAt").reverse().toArray();
    if (isViewMode) return all.filter((e) => e.visibility !== "private");
    return all;
  }, [isViewMode]);

  const mediaByEntry = useLiveQuery(async () => {
    const all = await db.mediaAssets.toArray();
    const map = new Map<string, MediaAsset[]>();
    for (const m of all) {
      if (!m.entryId) continue;
      if (isViewMode && m.visibility === "private") continue;
      const list = map.get(m.entryId) ?? [];
      list.push(m);
      map.set(m.entryId, list);
    }
    return map;
  }, [isViewMode]);

  if (entries === undefined) {
    return (
      <StorybookShell>
        <HaloLoader label="Opening archive" />
      </StorybookShell>
    );
  }

  const dayMap = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = toDateKey(e.recordedAt);
    const list = dayMap.get(key) ?? [];
    list.push(e);
    dayMap.set(key, list);
  }

  const days = Array.from(dayMap.keys()).sort().reverse();
  const selectedDate = days[0] ?? toDateKey(new Date().toISOString());
  const dayEntries = dayMap.get(selectedDate) ?? [];

  const photoCount = dayEntries.reduce((n, e) => {
    const m = mediaByEntry?.get(e.id) ?? [];
    return n + m.filter((x) => x.mimeType.startsWith("image/")).length;
  }, 0);

  return (
    <StorybookShell>
      <div className="days-spread memory-appear">
        <div className="days-spread__calendar">
          {days.slice(0, 8).map((d) => {
            const dayNum = d.split("-")[2];
            return (
              <Link
                key={d}
                href={`/days/${d}`}
                className={`day-bookmark ${d === selectedDate ? "day-bookmark--active" : ""}`}
              >
                {dayNum}
              </Link>
            );
          })}
        </div>

        <div className="days-spread__page">
          <h1 className="spread-title">{formatDayHeading(`${selectedDate}T12:00:00`)}</h1>
          <p className="day-stats">
            {dayEntries.length} moments · {photoCount} photos
          </p>
          <div className="scrapbook-grid">
            {dayEntries.map((entry, i) => {
              const media = mediaByEntry?.get(entry.id)?.[0];
              const size = i === 0 ? "hero" : i < 3 ? "med" : "sm";
              return (
                <div
                  key={entry.id}
                  className={`scrapbook-item scrapbook-item--${size} polaroid`}
                  style={{ transform: `rotate(${(i % 5 - 2) * 1.8}deg)` }}
                >
                  {media?.localBlobUrl && media.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.localBlobUrl} alt="" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-sm text-[var(--ink-muted)]">
                      <EditableText
                        value={entry.text ?? ""}
                        onSave={(text) => updateEntry(entry.id, { text })}
                        placeholder="Add a note…"
                        className="text-sm text-center"
                        multiline
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {!dayEntries.length && (
              <p className="col-span-full text-base text-[var(--ink-muted)] py-12 text-center">
                A quiet day — waiting for its first moment.
              </p>
            )}
          </div>
        </div>

        <div className="days-spread__timeline">
          <p className="storybook-widget__title mb-4">Day view</p>
          {dayEntries.map((entry) => {
            const media = mediaByEntry?.get(entry.id)?.[0];
            return (
              <div key={entry.id} className="timeline-entry">
                <time className="timeline-entry__time">{formatTime(entry.recordedAt)}</time>
                <div className="timeline-entry__body">
                  {media?.localBlobUrl && media.mimeType.startsWith("image/") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.localBlobUrl}
                      alt=""
                      className="mb-2 h-16 w-24 object-cover polaroid"
                    />
                  )}
                  <EditableText
                    value={entry.text ?? ""}
                    onSave={(text) => updateEntry(entry.id, { text })}
                    placeholder="What happened here?"
                    className="text-sm text-[var(--ink-soft)]"
                    multiline
                  />
                  <EditableText
                    value={entry.locationName ?? ""}
                    onSave={(locationName) => updateEntry(entry.id, { locationName })}
                    placeholder="Location"
                    className="mt-1 text-[0.5rem] uppercase tracking-widest text-[var(--ink-muted)]"
                    as="span"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StorybookShell>
  );
}
