"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExperienceMode, getShareViewUrl } from "@/lib/experience/mode";
import { cn } from "@/lib/utils";

function MoonIcon({ phase }: { phase: "writing" | "reading" | "signin" }) {
  if (phase === "signin") {
    return (
      <svg viewBox="0 0 64 64" className="lens-moon__svg" aria-hidden>
        <defs>
          <radialGradient id="moon-signin-glow" cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#fff6e8" />
            <stop offset="50%" stopColor="#dcc8a8" />
            <stop offset="100%" stopColor="#a8b8d8" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill="url(#moon-signin-glow)" />
        <circle cx="25" cy="27" r="2.5" fill="rgba(255,255,255,0.3)" />
        <path
          d="M 38 42 L 44 48 M 44 42 L 38 48"
          stroke="rgba(90,101,120,0.45)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (phase === "writing") {
    return (
      <svg viewBox="0 0 64 64" className="lens-moon__svg" aria-hidden>
        <defs>
          <radialGradient id="moon-writing-glow" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff9e8" />
            <stop offset="45%" stopColor="#e8d8b0" />
            <stop offset="100%" stopColor="#b8c8e0" />
          </radialGradient>
          <filter id="moon-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="32" cy="32" r="22" fill="url(#moon-writing-glow)" filter="url(#moon-soft-glow)" />
        <circle cx="24" cy="26" r="3" fill="rgba(255,255,255,0.35)" />
        <circle cx="38" cy="38" r="2" fill="rgba(255,255,255,0.2)" />
        <circle cx="42" cy="24" r="1.2" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="lens-moon__svg" aria-hidden>
      <defs>
        <radialGradient id="moon-reading-glow" cx="55%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#f0f4fc" />
          <stop offset="55%" stopColor="#c8d4e8" />
          <stop offset="100%" stopColor="#98aac8" />
        </radialGradient>
        <mask id="moon-crescent-mask">
          <rect width="64" height="64" fill="white" />
          <circle cx="42" cy="28" r="20" fill="black" />
        </mask>
      </defs>
      <circle
        cx="30"
        cy="32"
        r="22"
        fill="url(#moon-reading-glow)"
        mask="url(#moon-crescent-mask)"
      />
      <circle cx="48" cy="18" r="1" fill="#c8a878" className="lens-moon__star" />
      <circle cx="54" cy="28" r="0.7" fill="#c8a878" className="lens-moon__star lens-moon__star--delay" />
      <circle cx="44" cy="12" r="0.5" fill="#c8a878" className="lens-moon__star lens-moon__star--delay2" />
    </svg>
  );
}

export function LensRibbon() {
  const { mode, setMode, isOwner, viewLocked, isViewMode } = useExperienceMode();
  const [shareUrl, setShareUrl] = useState("/?view=1");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setShareUrl(getShareViewUrl());
  }, []);

  if (viewLocked) return null;

  if (!isOwner) {
    return (
      <aside className="lens-moon" aria-label="Sign in to edit">
        <Link href="/login" className="lens-moon__orb lens-moon__orb--signin" title="Sign in to edit">
          <span className="lens-moon__halo" aria-hidden />
          <MoonIcon phase="signin" />
        </Link>
        <div className="lens-moon__caption">
          <p className="lens-moon__mode">Sign in</p>
          <p className="lens-moon__hint">Tap the moon to edit</p>
        </div>
      </aside>
    );
  }

  const isWriting = mode === "edit";

  function toggle() {
    setMode(isWriting ? "view" : "edit");
    setExpanded(false);
  }

  return (
    <aside className="lens-moon" aria-label="Switch between writing and reading">
      <button
        type="button"
        className={cn(
          "lens-moon__orb",
          isWriting ? "lens-moon__orb--writing" : "lens-moon__orb--reading",
        )}
        onClick={toggle}
        aria-pressed={isWriting}
        title={isWriting ? "Preview what others see" : "Return to writing mode"}
      >
        <span className="lens-moon__halo" aria-hidden />
        <MoonIcon phase={isWriting ? "writing" : "reading"} />
      </button>

      <div className="lens-moon__caption">
        <p className="lens-moon__mode">{isWriting ? "Writing" : "Reading"}</p>
        <p className="lens-moon__hint">
          {isWriting ? "Tap the moon to preview" : "Tap the moon to edit"}
        </p>
      </div>

      {isViewMode && (
        <div className="lens-moon__share">
          <button
            type="button"
            className="lens-moon__share-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "Hide share link" : "Share with family →"}
          </button>
          {expanded && (
            <p className="lens-moon__share-url" title={shareUrl}>
              {shareUrl.replace(/^https?:\/\//, "")}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
