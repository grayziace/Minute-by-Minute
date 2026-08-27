"use client";

import { StorybookShell } from "@/components/storybook/StorybookShell";
import { ShareLinkPanel } from "@/components/layout/ShareLinkPanel";
import { EditModeGuard } from "@/components/layout/EditModeGuard";
import { BackupPanel } from "@/components/archive/BackupPanel";

export function SettingsPage() {
  return (
    <EditModeGuard>
      <StorybookShell>
        <div className="page-spread frame-spread memory-appear">
          <header className="page-spread__header">
            <h1 className="spread-title spread-title--vivid">Settings</h1>
            <p className="spread-subtitle">Your archive, your rules — backed up forever.</p>
          </header>

          <BackupPanel />

          <ShareLinkPanel />

          <section className="mt-8 space-y-6">
            <div className="storybook-widget">
              <h2 className="storybook-widget__title">Privacy</h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Default visibility: Private</p>
              <p className="text-sm text-[var(--ink-muted)]">
                Private moments stay hidden in visitor view. Only shared content appears for family and friends.
              </p>
            </div>

            <div className="storybook-widget">
              <h2 className="storybook-widget__title">Edit vs visitor view</h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                <strong>Edit</strong> — you capture, organise, and create vlogs and stories.
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                <strong>Visitor view</strong> — what others see: read-only, no capture button, no studio tools.
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Use the toggle top-right to preview visitor view before sharing your link.
              </p>
            </div>
          </section>
        </div>
      </StorybookShell>
    </EditModeGuard>
  );
}
