"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import { formatDayHeading, toDateKey } from "@/lib/utils";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function ScrapbookPage() {
  const days = useLiveQuery(async () => {
    const entries = await db.entries.orderBy("recordedAt").reverse().toArray();
    const keys = new Set<string>();
    for (const e of entries) keys.add(toDateKey(e.recordedAt));
    const media = await db.mediaAssets.toArray();
    for (const m of media) {
      if (m.capturedAt) keys.add(toDateKey(m.capturedAt));
    }
    return Array.from(keys);
  }, []);

  return (
    <PageShell>
      <header className="mb-10 memory-appear">
        <h1 className="font-serif text-3xl font-light text-gradient-angel">Scrapbook</h1>
        <p className="mt-2 text-sm text-muted">Collected fragments.</p>
      </header>

      <div className="space-y-3">
        {days?.map((date, i) => (
          <Link
            key={date}
            href={`/scrapbook/${date}`}
            className="memory-appear block"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <GlassPanel className="px-5 py-4 transition-all hover:shadow-[0_8px_32px_rgba(200,180,230,0.12)]">
              <span className="font-display text-[10px] tracking-[0.2em] text-foreground-soft">
                {formatDayHeading(`${date}T12:00:00`)}
              </span>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
