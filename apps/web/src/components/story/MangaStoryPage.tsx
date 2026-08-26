"use client";

import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { useExperienceMode } from "@/lib/experience/mode";
import { useApprovedStories } from "@/lib/video/local-studio";
import { formatDayHeading } from "@/lib/utils";

export function MangaStoryPage() {
  const { canEdit } = useExperienceMode();
  const chapters = useApprovedStories();

  return (
    <StorybookShell>
      <div className="frame-spread memory-appear">
        <header className="studio-spread__header">
          <Link href="/archive/ai" className="day-chapter__back">
            ← Studios
          </Link>
          <h1 className="spread-title">Story</h1>
          <p className="spread-subtitle">
            Manga chapters from days you closed at bedtime — only the stories you chose.
          </p>
        </header>

        {!chapters?.length ? (
          <div className="manga-empty paper-note paper-note--taped">
            <p className="manga-empty__title">No chapters yet</p>
            <p className="manga-empty__text">
              Open a day, add your moments, then tap <strong>I went to bed</strong> when you sleep.
              Pick which story ideas become manga — all, some, or none.
            </p>
            {canEdit && (
              <Link href="/days" className="storybook-widget__link">
                Open your days →
              </Link>
            )}
          </div>
        ) : (
          <div className="manga-chapters">
            {chapters.map(({ dateKey, stories }) => (
              <section key={dateKey} className="manga-chapter paper-note">
                <header className="manga-chapter__head">
                  <p className="storybook-widget__title">
                    {formatDayHeading(`${dateKey}T12:00:00`)}
                  </p>
                  <Link href={`/days/${dateKey}`} className="storybook-widget__link">
                    View day
                  </Link>
                </header>
                {stories.map((story) => (
                  <article key={story.id} className="manga-chapter__story">
                    <p className="manga-chapter__tone">{story.tone}</p>
                    <h2 className="manga-chapter__title">{story.title}</h2>
                    <p className="manga-chapter__summary">{story.summary}</p>
                    <div className="manga-chapter__panels">
                      <div className="manga-panel manga-panel--a" />
                      <div className="manga-panel manga-panel--b" />
                      <div className="manga-panel manga-panel--wide">
                        <p className="manga-panel__caption">{story.summary.slice(0, 80)}…</p>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </StorybookShell>
  );
}
