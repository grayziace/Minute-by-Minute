"use client";

import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { useExperienceMode } from "@/lib/experience/mode";

export function VideoDiaryPage() {
  const { canEdit } = useExperienceMode();
  return (
    <StorybookShell>
      <div className="frame-spread memory-appear">
        <header className="mb-8">
          <h1 className="spread-title">Video diary</h1>
          <p className="spread-subtitle">Finished episodes from your raw footage.</p>
        </header>
        <div className="storybook-widget mb-4">
          <p className="text-sm text-[var(--ink-soft)]">
            {canEdit
              ? "Upload clips throughout the day, then ask the editor to make today's vlog."
              : "Finished episodes from the archive."}
          </p>
          {canEdit && (
            <Link href="/archive/video" className="storybook-widget__link mt-4 inline-block">
              open video studio →
            </Link>
          )}
        </div>
        <div className="paper-note paper-note--taped max-w-md rotate-1">
          <p className="storybook-widget__title">Episode 014</p>
          <p className="text-lg font-medium mt-1">Getting lost again</p>
          <p className="text-[0.55rem] text-[var(--ink-muted)] mt-1">05:42 · placeholder</p>
        </div>
      </div>
    </StorybookShell>
  );
}
