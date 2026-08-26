"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExperienceMode } from "@/lib/experience/mode";

const STORAGE_KEY = "mbm-visitor-entered";

export function VisitorCover({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="visitor-cover">
      <div className="visitor-cover__page memory-appear">
        <p className="visitor-cover__eyebrow">A storybook</p>
        <h1 className="visitor-cover__title">Minute by Minute</h1>
        <p className="visitor-cover__subtitle">
          A story about ten months of becoming someone.
        </p>
        <p className="visitor-cover__hint">
          Wander through days, photographs, films, and stories — shared with you.
        </p>
        <button type="button" className="visitor-cover__begin" onClick={onBegin}>
          Begin
        </button>
        <p className="visitor-cover__note">Read-only · moments curated for you</p>
      </div>
    </div>
  );
}

export function VisitorGate({ children }: { children: React.ReactNode }) {
  const { viewLocked } = useExperienceMode();
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(true);

  useEffect(() => {
    if (!viewLocked) {
      setEntered(true);
      setReady(true);
      return;
    }
    setEntered(localStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, [viewLocked]);

  if (!ready) return null;

  if (viewLocked && !entered) {
    return (
      <VisitorCover
        onBegin={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setEntered(true);
        }}
      />
    );
  }

  return <>{children}</>;
}

/** Reset cover for testing share links */
export function VisitorCoverResetLink() {
  const { viewLocked } = useExperienceMode();
  if (!viewLocked) return null;
  return (
    <Link
      href="/?view=1"
      className="storybook-widget__link text-[0.45rem]"
      onClick={() => localStorage.removeItem(STORAGE_KEY)}
    >
      Back to cover
    </Link>
  );
}
