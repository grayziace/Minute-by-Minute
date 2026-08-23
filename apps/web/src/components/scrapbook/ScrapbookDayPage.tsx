"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { dayRange, formatDayHeading, formatTime, hashIndex } from "@/lib/utils";
import { MediaThumb } from "@/components/media/MediaThumb";
import { PageShell } from "@/components/ui/PageShell";
import { cn } from "@/lib/utils";

export function ScrapbookDayPage({ date }: { date: string }) {
  const { start, end } = dayRange(date);

  const content = useLiveQuery(async () => {
    const entries = await db.entries
      .where("recordedAt")
      .between(start, end, true, true)
      .sortBy("recordedAt");
    const media = await db.mediaAssets.toArray();
    const dayMedia = media.filter(
      (m) => m.capturedAt && m.capturedAt >= start && m.capturedAt <= end,
    );
    return { entries, dayMedia };
  }, [start, end]);

  const items = [
    ...(content?.entries.map((e) => ({
      type: "text" as const,
      id: e.id,
      time: e.recordedAt,
      text: e.text,
      mood: e.moodNote,
    })) ?? []),
    ...(content?.dayMedia.map((m) => ({
      type: "media" as const,
      id: m.id,
      time: m.capturedAt!,
      asset: m,
    })) ?? []),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const isChaotic = items.length >= 6;

  return (
    <PageShell className="pb-24">
      <header className="mb-6 memory-appear">
        <Link
          href="/scrapbook"
          className="text-[10px] uppercase tracking-[0.2em] text-secondary"
        >
          ← Scrapbook
        </Link>
        <h1 className="mt-3 font-serif text-xl tracking-[0.1em] text-gradient-angel">
          {formatDayHeading(`${date}T12:00:00`)}
        </h1>
      </header>

      <div
        className={cn(
          "relative",
          isChaotic ? "min-h-[120vh]" : "min-h-[50vh]",
        )}
      >
        {items.map((item, i) => {
          const rotation = ((i % 7) - 3) * (isChaotic ? 2.5 : 1.5);
          const width = hashIndex(item.id, 3) === 0 ? "52%" : "42%";
          return (
            <div
              key={item.id}
              className="memory-appear absolute"
              style={{
                top: `${(i % (isChaotic ? 8 : 5)) * (isChaotic ? 11 : 16) + 2}%`,
                left: i % 2 === 0 ? `${4 + (i % 3) * 4}%` : "auto",
                right: i % 2 === 1 ? `${4 + (i % 3) * 4}%` : "auto",
                width,
                transform: `rotate(${rotation}deg)`,
                animationDelay: `${i * 0.06}s`,
                zIndex: i,
              }}
            >
              {item.type === "text" ? (
                <div
                  className={cn(
                    "glass p-4",
                    (item.text?.length ?? 0) < 30 && "opacity-90",
                  )}
                >
                  <time className="text-[9px] tabular-nums tracking-wider text-muted">
                    {formatTime(item.time)}
                  </time>
                  {item.text && (
                    <p
                      className={cn(
                        "mt-1",
                        (item.text.length ?? 0) < 40
                          ? "font-hand text-lg text-foreground-soft"
                          : "font-serif text-sm",
                      )}
                    >
                      {item.text}
                    </p>
                  )}
                  {item.mood && (
                    <p className="mt-1 font-hand text-sm text-blush-deep">{item.mood}</p>
                  )}
                </div>
              ) : (
                <div className={cn("tape", hashIndex(item.id, 2) === 0 && "polaroid p-1")}>
                  <MediaThumb
                    asset={item.asset}
                    size="lg"
                    variant={hashIndex(item.id, 2) === 0 ? "polaroid" : "float"}
                  />
                  <time className="mt-2 block px-1 text-[9px] tabular-nums text-muted">
                    {formatTime(item.time)}
                  </time>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!items.length && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <div className="halo-loader mb-4 opacity-50" />
          <p className="font-serif italic text-muted">Empty page.</p>
        </div>
      )}
    </PageShell>
  );
}
