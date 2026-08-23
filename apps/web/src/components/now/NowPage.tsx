"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/dexie/db";
import {
  toDateKey,
  formatNowDayUpper,
  formatNowDateUpper,
  formatNowTime,
} from "@/lib/utils";
import { PageShell } from "@/components/ui/PageShell";
import { NowFragment, LUMINOUS_LAYOUTS } from "@/components/now/NowFragment";
import { useExperienceMode } from "@/lib/experience/mode";
import type { LuminousPhase } from "@/components/ui/LuminousWorld";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NowPage() {
  const [now, setNow] = useState(() => new Date());
  const [isMobile, setIsMobile] = useState(false);
  const { isViewMode, isEditMode } = useExperienceMode();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const todayKey = toDateKey(new Date().toISOString());

  const entries = useLiveQuery(async () => {
    const all = await db.entries.orderBy("recordedAt").toArray();
    const today = all.filter((e) => toDateKey(e.recordedAt) === todayKey);
    if (isViewMode) return today.filter((e) => e.visibility !== "private");
    return today;
  }, [todayKey, isViewMode]);

  const mediaByEntry = useLiveQuery(async () => {
    const allMedia = await db.mediaAssets.toArray();
    const map = new Map<string, MediaAsset[]>();
    for (const m of allMedia) {
      if (!m.entryId) continue;
      if (isViewMode && m.visibility === "private") continue;
      const list = map.get(m.entryId) ?? [];
      list.push(m);
      map.set(m.entryId, list);
    }
    return map;
  }, [isViewMode]);

  const recentMedia = useLiveQuery(async () => {
    const items = await db.mediaAssets.orderBy("createdAt").reverse().limit(1).toArray();
    if (isViewMode) return items.filter((m) => m.visibility !== "private");
    return items;
  }, [isViewMode]);

  const lastLocation = useLiveQuery(async () => {
    const withLocation = await db.entries
      .filter((e) => !!e.locationName)
      .reverse()
      .sortBy("recordedAt");
    return withLocation[0]?.locationName ?? "China";
  }, []);

  const count = entries?.length ?? 0;
  const phase: LuminousPhase =
    count === 0 ? "open" : count <= 2 ? "awakening" : "filled";
  const isEmpty = count === 0;
  const bgMedia = recentMedia?.[0];

  return (
    <PageShell
      layout="full"
      memoryUrl={bgMedia?.localBlobUrl}
      memoryIsVideo={bgMedia?.mimeType.startsWith("video/")}
      luminousPhase={phase}
      className={cn("luminous-now", isViewMode && "luminous-now--experience")}
    >
      {/* Time exists inside the bloom — not a hero on darkness */}
      <div
        className={cn(
          "luminous-now__presence memory-appear",
          isMobile && "luminous-now__presence--mobile",
          count > 0 && "luminous-now__presence--recede",
        )}
      >
        <p className="luminous-now__day">{formatNowDayUpper(now)}</p>
        <p className="luminous-now__date">{formatNowDateUpper(now)}</p>
        <p className="luminous-now__time">{formatNowTime(now)}</p>
        <p className="luminous-now__place">{lastLocation ?? "—"}</p>
      </div>

      {/* Desktop: editorial collage in the light */}
      {!isMobile && entries && entries.length > 0 && (
        <div className="luminous-now__collage">
          {entries.map((entry, i) => (
            <NowFragment
              key={entry.id}
              entry={entry}
              media={mediaByEntry?.get(entry.id) ?? []}
              layout={LUMINOUS_LAYOUTS[i % LUMINOUS_LAYOUTS.length]}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Mobile: intimate vertical flow through the light */}
      {isMobile && entries && entries.length > 0 && (
        <div className="luminous-now__mobile-flow">
          {entries.map((entry, i) => (
            <NowFragment
              key={entry.id}
              entry={entry}
              media={mediaByEntry?.get(entry.id) ?? []}
              layout={LUMINOUS_LAYOUTS[i % LUMINOUS_LAYOUTS.length]}
              index={i}
              mobile
            />
          ))}
        </div>
      )}

      {/* Empty: unwritten luminous space */}
      {isEmpty && (
        <p className="luminous-now__invitation memory-appear font-hand">
          Notice something.
        </p>
      )}

      {isEditMode && (
        <Link href="/add" className="luminous-now__capture edit-only font-hand">
          capture
        </Link>
      )}

      {isViewMode && !isEmpty && (
        <Link href="/timeline" className="luminous-now__continue font-hand">
          continue
        </Link>
      )}
    </PageShell>
  );
}
