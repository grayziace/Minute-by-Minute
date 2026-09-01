"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useExperienceMode } from "@/lib/experience/mode";
import {
  KNOCK_SEQUENCE,
  type KnockCorner,
} from "@/lib/experience/secret-knock";

const STORAGE_KEY = "mbm-visitor-entered";
const KNOCK_TIMEOUT_MS = 12000;

function SecretKnock({ onUnlock }: { onUnlock: () => void }) {
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState<KnockCorner | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setStep(0);
    setLit(null);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const bumpTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(reset, KNOCK_TIMEOUT_MS);
  }, [reset]);

  const tapCorner = useCallback(
    (corner: KnockCorner) => {
      if (unlocking) return;
      const expected = KNOCK_SEQUENCE[step];
      if (corner !== expected) {
        reset();
        return;
      }
      setLit(corner);
      bumpTimer();
      const next = step + 1;
      if (next >= KNOCK_SEQUENCE.length) {
        setUnlocking(true);
        if (timer.current) clearTimeout(timer.current);
        setTimeout(() => onUnlock(), 600);
        return;
      }
      setStep(next);
    },
    [step, unlocking, onUnlock, reset, bumpTimer],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <>
      {(["tl", "tr", "br", "bl"] as KnockCorner[]).map((corner) => (
        <button
          key={corner}
          type="button"
          aria-label=" "
          className={`visitor-knock visitor-knock--${corner}${lit === corner ? " visitor-knock--lit" : ""}`}
          onClick={() => tapCorner(corner)}
        />
      ))}
      {unlocking && <div className="visitor-cover__unlock-flash" aria-hidden />}
    </>
  );
}

export function VisitorCover({ onBegin }: { onBegin: () => void }) {
  const router = useRouter();
  const { unlockKnock } = useExperienceMode();
  const [unlocking, setUnlocking] = useState(false);

  function handleKnockSuccess() {
    setUnlocking(true);
    unlockKnock();
    setTimeout(() => router.push("/login"), 700);
  }

  return (
    <div className="visitor-cover">
      <div className={`visitor-cover__page memory-appear${unlocking ? " visitor-cover__page--unlocking" : ""}`}>
        <SecretKnock onUnlock={handleKnockSuccess} />
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
  const { viewLocked, isOwner } = useExperienceMode();
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(true);

  useEffect(() => {
    if (!viewLocked || isOwner) {
      setEntered(true);
      setReady(true);
      return;
    }
    setEntered(localStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, [viewLocked, isOwner]);

  if (!ready) return null;

  if (viewLocked && !isOwner && !entered) {
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
  const { viewLocked, isOwner } = useExperienceMode();
  if (!viewLocked || isOwner) return null;
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
