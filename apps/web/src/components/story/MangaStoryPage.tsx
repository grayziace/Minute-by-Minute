"use client";

import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { useExperienceMode } from "@/lib/experience/mode";

export function MangaStoryPage() {
  const { canEdit } = useExperienceMode();
  return (
    <StorybookShell>
      <div className="frame-spread memory-appear">
        <header className="mb-8">
          <h1 className="spread-title">Story</h1>
          <p className="spread-subtitle">Manga chapters interpreting your days.</p>
        </header>
        <div className="grid grid-cols-2 gap-3 max-w-lg mb-6">
          <div className="aspect-[4/3] bg-gradient-to-br from-[#e8eef8] to-[#d8c8e0] border border-[var(--paper-edge)] rounded-sm p-2">
            <p className="font-hand text-xs italic">&ldquo;I didn&apos;t know where I was going…&rdquo;</p>
          </div>
          <div className="aspect-[4/3] bg-gradient-to-br from-[#f0e8f0] to-[#e8dce8] border border-[var(--paper-edge)] rounded-sm" />
          <div className="col-span-2 aspect-[2/1] bg-gradient-to-r from-[#f8f0e8] to-[#e8eef8] border border-[var(--paper-edge)] rounded-sm flex items-end p-3">
            <p className="font-hand text-sm">&ldquo;…but I ended up somewhere beautiful.&rdquo;</p>
          </div>
        </div>
        {canEdit && (
          <Link href="/archive/ai" className="storybook-widget__link">create a story →</Link>
        )}
      </div>
    </StorybookShell>
  );
}
