"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { formatDayHeading, toDateKey, hashIndex } from "@/lib/utils";
import { PageShell } from "@/components/ui/PageShell";
import { SparkleField } from "@/components/ui/SparkleField";
import { HaloLoader } from "@/components/ui/HaloLoader";

interface TimelinePageProps {
  variant?: "timeline" | "days";
}

export function TimelinePage({ variant = "timeline" }: TimelinePageProps) {
  const isDays = variant === "days";
  const dayHref = (date: string) => (isDays ? `/days/${date}` : `/timeline/${date}`);

  const days = useLiveQuery(async () => {
    const entries = await db.entries.orderBy("recordedAt").reverse().toArray();
    const map = new Map<string, { count: number; preview: string | null }>();

    for (const entry of entries) {
      const key = toDateKey(entry.recordedAt);
      const existing = map.get(key) ?? { count: 0, preview: null };
      existing.count += 1;
      if (!existing.preview && entry.text) {
        existing.preview = entry.text.slice(0, 80);
      }
      map.set(key, existing);
    }

    return Array.from(map.entries()).map(([date, info]) => ({
      date,
      ...info,
    }));
  }, []);

  if (days === undefined) {
    return (
      <PageShell>
        <HaloLoader label="Opening archive" />
      </PageShell>
    );
  }

  return (
    <PageShell layout="immersive-scroll" sparkles={false} className="days-page mx-auto max-w-lg px-5 pt-12">
      <SparkleField />
      <header className="days-page__header memory-appear">
        <h1 className="days-page__title font-serif">{isDays ? "Days" : "Timeline"}</h1>
        <p className="days-page__subtitle">
          {isDays ? "Walk back through your life, one day at a time." : "Each day is an episode."}
        </p>
      </header>

      <div className="days-list">
        {days.map((day, i) => (
          <Link
            key={day.date}
            href={dayHref(day.date)}
            className="day-card memory-appear group"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="day-card__shimmer" aria-hidden />
            <div className="day-card__inner">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="day-card__date font-display">
                  {formatDayHeading(`${day.date}T12:00:00`)}
                </h2>
                <span className="day-card__count">
                  {day.count} {day.count === 1 ? "moment" : "moments"}
                </span>
              </div>
              {day.preview ? (
                <p className="day-card__preview font-serif">{day.preview}</p>
              ) : (
                <p className="day-card__preview day-card__preview--empty font-hand">Visual day</p>
              )}
            </div>
          </Link>
        ))}

        {!days.length && (
          <div className="day-card day-card--empty memory-appear py-16 text-center">
            <p className="font-hand text-xl text-muted">The archive is waiting.</p>
            <p className="mt-2 text-sm text-muted">Start with now.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
