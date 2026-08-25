"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { toDateKey, formatNowDayUpper, formatNowDateUpper, formatNowTime } from "@/lib/utils";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { IllustratedScene } from "@/components/storybook/IllustratedScene";
import { EditableText } from "@/components/ui/EditableText";
import { useExperienceMode } from "@/lib/experience/mode";
import { usePageNote, PAGE_NOTES } from "@/lib/page-notes";

export function NowPage() {
  const [now, setNow] = useState(() => new Date());
  const { isViewMode, canEdit } = useExperienceMode();

  const mood = usePageNote(PAGE_NOTES.nowMood, "curious, light, excited");
  const pinned = usePageNote(PAGE_NOTES.nowPinned, "The sun feels so beautiful here today.");
  const prompt = usePageNote(PAGE_NOTES.nowPrompt, "What is happening here?");
  const subprompt = usePageNote(PAGE_NOTES.nowSubprompt, "Notice this moment.");
  const locationNote = usePageNote(PAGE_NOTES.nowLocation, "");

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

  const locationPlaceholder = lastLocation ?? "China";
  const bgMedia = recentMedia?.[0];
  const count = entries?.length ?? 0;

  return (
    <StorybookShell>
      <div className="now-spread memory-appear">
        <aside className="now-spread__left">
          <p className="now-spread__day">{formatNowDayUpper(now)}</p>
          <p className="now-spread__date">{formatNowDateUpper(now)}</p>
          <p className="now-spread__time">{formatNowTime(now)}</p>
          <p className="now-spread__location">
            <EditableText
              value={locationNote.value}
              onSave={locationNote.save}
              placeholder={locationPlaceholder}
              className="now-spread__location-text"
              as="span"
            />
          </p>
          <EditableText
            value={prompt.value}
            onSave={prompt.save}
            placeholder="What is happening here?"
            className="now-spread__prompt"
            multiline
          />
          <EditableText
            value={subprompt.value}
            onSave={subprompt.save}
            placeholder="Notice this moment."
            className="now-spread__subprompt"
          />
          {canEdit && (
            <Link href="/add" className="now-spread__capture edit-only">
              <span className="now-spread__orb" />
              <span className="now-spread__capture-label">Capture this moment</span>
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

          <div className="paper-note paper-note--taped now-mood-note">
            <p className="storybook-widget__title">Today&apos;s mood</p>
            <EditableText
              value={mood.value}
              onSave={mood.save}
              placeholder="How does today feel?"
              className="mt-1 text-sm text-[var(--ink-soft)]"
            />
          </div>

          <div className="paper-note paper-note--pinned now-pinned-note">
            <EditableText
              value={pinned.value}
              onSave={pinned.save}
              placeholder="A note about right now…"
              className="text-sm text-[var(--ink-soft)]"
              multiline
            />
          </div>

          {count > 0 && (
            <div className="now-moments-strip">
              {entries!.slice(-5).map((e, i) => (
                <Link
                  key={e.id}
                  href={canEdit ? `/add?edit=${e.id}` : `/days/${todayKey}`}
                  className="now-moment-chip"
                  style={{ "--rot": `${(i - 2) * 1.5}deg` } as React.CSSProperties}
                >
                  {e.text?.slice(0, 24) ?? "moment"}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="widget-row memory-appear" style={{ animationDelay: "0.15s" }}>
        <div className="storybook-widget">
          <p className="storybook-widget__title">Frame</p>
          <p className="text-sm text-[var(--ink-soft)]">Favourite photographs from your days.</p>
          <Link href="/frame" className="storybook-widget__link">View gallery</Link>
        </div>
        <div className="storybook-widget">
          <p className="storybook-widget__title">Video diary</p>
          <p className="text-sm text-[var(--ink-soft)]">Finished vlogs from your raw clips.</p>
          <Link href="/video" className="storybook-widget__link">View episodes</Link>
        </div>
        <div className="storybook-widget">
          <p className="storybook-widget__title">Story</p>
          <p className="text-sm text-[var(--ink-soft)]">Manga chapters of your days.</p>
          <Link href="/story" className="storybook-widget__link">Open stories</Link>
        </div>
      </div>

      <MeBannerInline />
    </StorybookShell>
  );
}

function MeBannerInline() {
  const insight = usePageNote(
    PAGE_NOTES.meInsight,
    "You seem happiest on days when you explore somewhere new, without a plan.",
  );

  return (
    <div className="me-banner memory-appear" style={{ animationDelay: "0.25s" }}>
      <EditableText
        value={insight.value}
        onSave={insight.save}
        placeholder="An observation about you…"
        className="me-banner__text flex-1"
        multiline
      />
      <Link href="/me" className="me-banner__cta">Explore insights</Link>
    </div>
  );
}
