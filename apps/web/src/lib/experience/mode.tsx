"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  readKnockUnlocked,
  setKnockUnlocked,
  isProductionGuest,
} from "@/lib/experience/secret-knock";

export type ExperienceMode = "edit" | "view";

interface ExperienceContextValue {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
  isViewMode: boolean;
  isEditMode: boolean;
  /** Signed in — you, the archive owner */
  isOwner: boolean;
  /** Visitor or share link — cannot switch to edit */
  viewLocked: boolean;
  /** Secret knock passed this session — may open sign-in */
  knockUnlocked: boolean;
  unlockKnock: () => void;
  canEdit: boolean;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const MODE_STORAGE_KEY = "mbm-experience-mode";
const VIEW_LOCKED_KEY = "mbm-view-locked";

function readViewLockedFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "1" || params.get("share") === "1";
}

export function ExperienceModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ExperienceMode>("view");
  const [isOwner, setIsOwner] = useState(false);
  const [viewLocked, setViewLocked] = useState(true);
  const [knockUnlocked, setKnockUnlockedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const unlockKnock = useCallback(() => {
    setKnockUnlocked();
    setKnockUnlockedState(true);
  }, []);

  useEffect(() => {
    setKnockUnlockedState(readKnockUnlocked());

    const urlLocked = readViewLockedFromUrl();
    const storedLocked = localStorage.getItem(VIEW_LOCKED_KEY) === "1";
    const shareLocked = urlLocked || storedLocked;

    if (urlLocked) {
      localStorage.setItem(VIEW_LOCKED_KEY, "1");
    }

    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        const isLocalDev =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1");
        const owner = !!data.authenticated || (isLocalDev && !shareLocked);
        setIsOwner(owner);

        const guestOnLive = isProductionGuest() && !owner;
        const locked = shareLocked || guestOnLive;
        setViewLocked(locked);

        if (locked || !owner) {
          setModeState("view");
          document.documentElement.dataset.experience = "view";
        } else {
          const stored = localStorage.getItem(MODE_STORAGE_KEY) as ExperienceMode | null;
          const next = stored === "view" ? "view" : "edit";
          setModeState(next);
          document.documentElement.dataset.experience = next;
        }
      })
      .catch(() => {
        const isLocalDev =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1");
        const guestOnLive = isProductionGuest();
        if (shareLocked || guestOnLive || !isLocalDev) {
          setModeState("view");
          setViewLocked(true);
          document.documentElement.dataset.experience = "view";
        } else {
          setIsOwner(true);
          setViewLocked(false);
          setModeState("edit");
          document.documentElement.dataset.experience = "edit";
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const setMode = useCallback(
    (next: ExperienceMode) => {
      if (viewLocked || !isOwner) return;
      setModeState(next);
      localStorage.setItem(MODE_STORAGE_KEY, next);
      document.documentElement.dataset.experience = next;
    },
    [viewLocked, isOwner],
  );

  useEffect(() => {
    if (hydrated && viewLocked && !isOwner) {
      setModeState("view");
      document.documentElement.dataset.experience = "view";
    }
  }, [hydrated, viewLocked, isOwner]);

  const toggleMode = useCallback(() => {
    if (viewLocked || !isOwner) return;
    setMode(mode === "edit" ? "view" : "edit");
  }, [mode, setMode, viewLocked, isOwner]);

  const isViewMode = mode === "view" || !isOwner;
  const isEditMode = mode === "edit" && isOwner && !viewLocked;
  const canEdit = isOwner && !viewLocked && mode === "edit";

  return (
    <ExperienceContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isViewMode,
        isEditMode,
        isOwner,
        viewLocked,
        knockUnlocked,
        unlockKnock,
        canEdit,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperienceMode() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperienceMode must be used within ExperienceModeProvider");
  }
  return ctx;
}

/** Share URL for family & friends — always view-only */
export function getShareViewUrl(origin = ""): string {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/?view=1`;
}
