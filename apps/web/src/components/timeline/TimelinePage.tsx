"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { formatDayHeading, toDateKey, hashIndex } from "@/lib/utils";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { HaloLoader } from "@/components/ui/HaloLoader";

export function TimelinePage() {
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
    <PageShell>
      <header className="mb-10 memory-appear">
        <h1 className="font-serif text-3xl font-light tracking-wide text-gradient-angel">
          Timeline
        </h1>
        <p className="mt-2 text-sm text-muted">Each day is an episode.</p>
      </header>

      <div className="space-y-4">
        {days.map((day, i) => (
          <Link
            key={day.date}
            href={`/timeline/${day.date}`}
            className="memory-appear block"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <GlassPanel
              className="group px-5 py-5 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(140,180,230,0.15)]"
              strong={hashIndex(day.date, 4) === 0}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-[11px] tracking-[0.2em] text-foreground group-hover:text-ice-deep">
                  {formatDayHeading(`${day.date}T12:00:00`)}
                </h2>
                <span className="text-[10px] tabular-nums text-muted">
                  {day.count} {day.count === 1 ? "moment" : "moments"}
                </span>
              </div>
              {day.preview ? (
                <p className="mt-3 line-clamp-2 font-serif text-sm text-foreground-soft">
                  {day.preview}
                </p>
              ) : (
                <p className="mt-3 font-serif text-sm italic text-muted">Visual day</p>
              )}
            </GlassPanel>
          </Link>
        ))}

        {!days.length && (
          <GlassPanel className="py-16 text-center">
            <p className="font-serif text-lg italic text-muted">
              The archive is empty.
            </p>
            <p className="mt-2 text-sm">Start with now.</p>
          </GlassPanel>
        )}
      </div>
    </PageShell>
  );
}
