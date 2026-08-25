"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { toDateKey, formatNowDayUpper, formatNowDateUpper, formatNowTime } from "@/lib/utils";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { IllustratedScene } from "@/components/storybook/IllustratedScene";
import { useExperienceMode } from "@/lib/experience/mode";
import type { MediaAsset } from "@/lib/types";

export function NowPage() {
  const [now, setNow] = useState(() => new Date());
  const { isViewMode, canEdit } = useExperienceMode();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayKey = toDateKey(new Date().toISOString());

  const entries = useLiveQuery(async () => {
    const all = await db.entries.orderBy("recordedAt").toArray();
    const today = all.filter((e) => toDateKey(e.recordedAt) === todayKey);
    if (isViewMode) return today.filter((e) => e.visibility !== "private");
    return today;
  }, [todayKey, isViewMode]);

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

  const bgMedia = recentMedia?.[0];
  const count = entries?.length ?? 0;

  return (
    <StorybookShell>
      <div className="now-spread memory-appear">
        <aside className="now-spread__left">
          <p className="now-spread__day">{formatNowDayUpper(now)}</p>
          <p className="now-spread__date">{formatNowDateUpper(now)}</p>
          <p className="now-spread__time">
            {formatNowTime(now)}
            <span className="now-spread__time-stars" aria-hidden>
              <span className="now-spread__star" />
              <span className="now-spread__star" />
              <span className="now-spread__star" />
            </span>
          </p>
          <p className="now-spread__location">
            <svg className="now-spread__pin" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
              <path d="M5 0C3.3 0 2 1.3 2 3c0 2.2 3 7 3 7s3-4.8 3-7c0-1.7-1.3-3-3-3zm0 4a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            {lastLocation ?? "China"}
          </p>
          <p className="now-spread__prompt">
            {isViewMode ? "You are here, in this chapter." : "What is happening here?"}
          </p>
          <p className="now-spread__subprompt">
            {isViewMode ? "A moment from the archive." : "Notice this moment."}
          </p>
          {canEdit && (
            <Link href="/add" className="now-spread__capture edit-only">
              <span className="now-spread__orb" />
              <span className="now-spread__capture-label">capture this moment</span>
            </Link>
          )}
        </aside>

        <section className="now-spread__right">
          <div className="now-spread__scene-wrap">
            <IllustratedScene
              mediaUrl={bgMedia?.localBlobUrl}
              isVideo={bgMedia?.mimeType.startsWith("video/")}
            />
          </div>

          <div className="paper-note paper-note--taped now-mood-note font-hand">
            <p className="text-[0.65rem] uppercase tracking-widest text-[var(--ink-muted)]">Today&apos;s mood</p>
            <p className="mt-1 text-sm">curious, light, excited</p>
          </div>

          <div className="paper-note paper-note--pinned now-pinned-note font-hand">
            <p className="text-sm italic">&ldquo;The sun feels so beautiful here today.&rdquo;</p>
          </div>

          {count > 0 && (
            <div className="now-moments-strip">
              {entries!.slice(-5).map((e, i) => (
                <span
                  key={e.id}
                  className="now-moment-chip"
                  style={{ "--rot": `${(i - 2) * 1.5}deg` } as React.CSSProperties}
                >
                  {e.text?.slice(0, 24) ?? "moment"}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bottom widgets like the design mockup */}
      <div className="widget-row memory-appear" style={{ animationDelay: "0.15s" }}>
        <div className="storybook-widget">
          <p className="storybook-widget__title">Frame</p>
          <p className="font-hand text-sm text-[var(--ink-soft)]">Favourite photographs from your days.</p>
          <Link href="/frame" className="storybook-widget__link">view gallery →</Link>
        </div>
        <div className="storybook-widget">
          <p className="storybook-widget__title">Video diary</p>
          <p className="font-hand text-sm text-[var(--ink-soft)]">Finished vlogs from your raw clips.</p>
          <Link href="/video" className="storybook-widget__link">view episodes →</Link>
        </div>
        <div className="storybook-widget">
          <p className="storybook-widget__title">Story</p>
          <p className="font-hand text-sm text-[var(--ink-soft)]">Manga chapters of your days.</p>
          <Link href="/story" className="storybook-widget__link">open stories →</Link>
        </div>
      </div>

      <div className="me-banner memory-appear" style={{ animationDelay: "0.25s" }}>
        <p className="me-banner__text">
          You seem happiest on days when you explore somewhere new, without a plan.
        </p>
        <Link href="/me" className="me-banner__cta">explore insights →</Link>
      </div>
    </StorybookShell>
  );
}
