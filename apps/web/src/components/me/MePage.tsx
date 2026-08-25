"use client";

import Link from "next/link";
import { StorybookShell } from "@/components/storybook/StorybookShell";
import { ShareLinkPanel } from "@/components/layout/ShareLinkPanel";
import { EditableText } from "@/components/ui/EditableText";
import { useExperienceMode } from "@/lib/experience/mode";
import { usePageNote, PAGE_NOTES } from "@/lib/page-notes";

export function MePage() {
  const { isViewMode, canEdit } = useExperienceMode();
  const insight = usePageNote(
    PAGE_NOTES.meInsight,
    "You seem happiest on days when you explore somewhere new, without a plan.",
  );
  const question = usePageNote(
    PAGE_NOTES.meQuestion,
    "What have I learned about myself so far?",
  );

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
          <EditableText
            value={question.value}
            onSave={question.save}
            placeholder="What have I learned about myself so far?"
            className="text-xl font-medium text-[var(--ink-soft)]"
          />
          <p className="mt-4 text-sm text-[var(--ink-muted)] leading-relaxed">
            {canEdit
              ? "Capture more days first. Then ask — and follow the thread back through your own memories."
              : "Observations drawn from shared moments in this archive."}
          </p>
        </div>
        <div className="me-banner mt-12 rounded-sm">
          <EditableText
            value={insight.value}
            onSave={insight.save}
            placeholder="An observation about you…"
            className="me-banner__text flex-1"
            multiline
          />
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
