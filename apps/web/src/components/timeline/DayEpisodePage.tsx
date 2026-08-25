"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { dayRange, formatDayHeading } from "@/lib/utils";
import { EntryCard } from "@/components/timeline/EntryCard";
import type { MediaAsset } from "@/lib/types";
import { PageShell } from "@/components/ui/PageShell";

export function DayEpisodePage({ date }: { date: string }) {
  const { start, end } = dayRange(date);

  const entries = useLiveQuery(async () => {
    return db.entries
      .where("recordedAt")
      .between(start, end, true, true)
      .sortBy("recordedAt");
  }, [start, end]);

  const mediaByEntry = useLiveQuery(async () => {
    const allMedia = await db.mediaAssets.toArray();
    const map = new Map<string, MediaAsset[]>();
    for (const m of allMedia) {
      if (!m.entryId) continue;
      const list = map.get(m.entryId) ?? [];
      list.push(m);
      map.set(m.entryId, list);
    }
    return map;
  }, []);

  const isQuiet = (entries?.length ?? 0) <= 2;

  return (
    <PageShell layout="immersive-scroll" className="max-w-none pb-24 pt-0 mx-auto max-w-4xl px-5 md:px-12">
      <header className="sticky top-0 z-20 px-5 py-6 glass-strong">
        <Link
          href="/days"
          className="text-[10px] uppercase tracking-[0.2em] text-secondary hover:text-ice-deep"
        >
          ← Timeline
        </Link>
        <h1 className="mt-3 font-serif text-xl tracking-[0.12em] text-gradient-angel">
          {formatDayHeading(`${date}T12:00:00`)}
        </h1>
      </header>

      <div className={isQuiet ? "px-8 py-12" : "px-5 py-6"}>
        {entries?.map((entry, i) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            media={mediaByEntry?.get(entry.id) ?? []}
            cinematic
            index={i}
          />
        ))}

        {!entries?.length && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="halo-loader mb-6 opacity-60" />
            <p className="font-serif text-lg italic text-muted">A quiet day.</p>
            <p className="mt-2 text-sm text-foreground-soft">A lot of white space.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
