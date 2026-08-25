"use client";

import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { useExperienceMode } from "@/lib/experience/mode";

export function CharactersPage() {
  return (
    <EditModeGuard>
      <CharactersPageInner />
    </EditModeGuard>
  );
}

function CharactersPageInner() {
  return (
    <StorybookShell>
      <div className="frame-spread memory-appear">
        <header className="mb-8">
          <h1 className="spread-title">Characters</h1>
          <p className="spread-subtitle">The cast of your story — consistent across every manga chapter.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="paper-note paper-note--taped">
            <p className="storybook-widget__title">Yueling</p>
            <p className="font-serif text-xl mt-1">main character</p>
            <p className="font-hand text-sm mt-3 text-[var(--ink-soft)]">
              usually wears her hair down · looks confused when navigating somewhere new
            </p>
            <p className="text-[0.5rem] uppercase tracking-widest text-[var(--ink-muted)] mt-4">
              create from description or photos
            </p>
          </div>
          <div className="storybook-widget flex flex-col items-center justify-center min-h-[200px]">
            <p className="font-hand text-lg text-[var(--ink-muted)]">+ new character</p>
            <Link href="/archive/ai" className="storybook-widget__link mt-4">open character studio →</Link>
          </div>
        </div>
      </div>
    </StorybookShell>
  );
}
