"use client";

import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { ShareLinkPanel } from "@/components/layout/ShareLinkPanel";
import { useExperienceMode } from "@/lib/experience/mode";

export function MePage() {
  const { isViewMode, canEdit } = useExperienceMode();

  return (
    <StorybookShell>
      <div className="frame-spread memory-appear">
        <header className="mb-8">
          <h1 className="spread-title">Me</h1>
          <p className="spread-subtitle">
            {isViewMode ? "Reflections from the archive." : "Patterns in your archive — when you ask."}
          </p>
        </header>
        <div className="paper-note paper-note--pinned max-w-lg mx-auto text-center py-8">
          <p className="font-hand text-2xl text-[var(--ink-soft)]">
            What have I learned about myself so far?
          </p>
          <p className="mt-4 text-sm text-[var(--ink-muted)] leading-relaxed">
            {canEdit
              ? "Capture more days first. Then ask — and follow the thread back through your own memories."
              : "Observations drawn from shared moments in this archive."}
          </p>
        </div>
        <div className="me-banner mt-12 rounded-sm">
          <p className="me-banner__text">
            You seem happiest on days when you explore somewhere new, without a plan.
          </p>
          {isViewMode ? (
            <span className="me-banner__cta opacity-50">from the archive</span>
          ) : (
            <Link href="/me" className="me-banner__cta">explore insights →</Link>
          )}
        </div>
        {canEdit && (
          <div className="mt-10">
            <ShareLinkPanel />
            <Link href="/archive/settings" className="storybook-widget__link mt-4 inline-block">
              all settings →
            </Link>
          </div>
        )}
      </div>
    </StorybookShell>
  );
}
