"use client";

import { useEffect, useState } from "react";
import { useExperienceMode, getShareViewUrl } from "@/lib/experience/mode";

export function LensRibbon() {
  const { mode, setMode, isOwner, viewLocked, isViewMode } = useExperienceMode();
  const [shareUrl, setShareUrl] = useState("/?view=1");

  useEffect(() => {
    setShareUrl(getShareViewUrl());
  }, []);

  if (!isOwner || viewLocked) return null;

  const isWriting = mode === "edit";

  return (
    <aside className="lens-ribbon" aria-label="Switch between writing and reading lens">
      <div className="lens-ribbon__stack">
        <button
          type="button"
          className={`lens-ribbon__tab ${isWriting ? "lens-ribbon__tab--active" : ""}`}
          onClick={() => setMode("edit")}
          aria-pressed={isWriting}
        >
          <span className="lens-ribbon__icon" aria-hidden>✎</span>
          <span className="lens-ribbon__label">Writing</span>
        </button>

        <button
          type="button"
          className={`lens-ribbon__tab lens-ribbon__tab--read ${!isWriting ? "lens-ribbon__tab--active" : ""}`}
          onClick={() => setMode("view")}
          aria-pressed={isViewMode}
        >
          <span className="lens-ribbon__icon" aria-hidden>◉</span>
          <span className="lens-ribbon__label">Reading</span>
        </button>
      </div>

      {isViewMode && (
        <p className="lens-ribbon__share" title="Share link for family and friends">
          Share: {shareUrl.replace(/^https?:\/\//, "")}
        </p>
      )}
    </aside>
  );
}
