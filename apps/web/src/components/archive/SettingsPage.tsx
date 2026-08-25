"use client";

import { StorybookShell } from "@/components/storybook/StorybookShell";
import { ShareLinkPanel } from "@/components/layout/ShareLinkPanel";
import { EditModeGuard } from "@/components/layout/EditModeGuard";

export function SettingsPage() {
  return (
    <EditModeGuard>
      <StorybookShell>
        <div className="frame-spread memory-appear max-w-lg">
          <header className="mb-8">
            <h1 className="spread-title">Settings</h1>
            <p className="spread-subtitle">Your archive, your rules.</p>
          </header>

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
