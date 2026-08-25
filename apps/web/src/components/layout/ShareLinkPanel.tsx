"use client";

import { useState } from "react";
import { useExperienceMode, getShareViewUrl } from "@/lib/experience/mode";

export function ShareLinkPanel() {
  const { isOwner, viewLocked } = useExperienceMode();
  const [copied, setCopied] = useState(false);

  if (!isOwner || viewLocked) return null;

  const shareUrl = getShareViewUrl();

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="paper-note paper-note--taped mt-6">
      <h2 className="storybook-widget__title">Share with family & friends</h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
        Send this link. They can install the app and browse your archive — read-only, no editing.
      </p>
      <p className="mt-3 break-all rounded-sm bg-[var(--ivory)] px-3 py-2 font-mono text-[0.65rem] text-[var(--ink-muted)]">
        {shareUrl}
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className="storybook-widget__link mt-3 bg-none border-none cursor-pointer p-0"
      >
        {copied ? "copied ✓" : "copy visitor link →"}
      </button>
    </div>
  );
}
