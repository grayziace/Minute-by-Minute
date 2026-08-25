"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ExperienceMode = "edit" | "view";

interface ExperienceContextValue {
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  toggleMode: () => void;
  isViewMode: boolean;
  isEditMode: boolean;
  /** Signed in with passkey — you, the archive owner */
  isOwner: boolean;
  /** Visitor or share link — cannot switch to edit */
  viewLocked: boolean;
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
  const [mode, setModeState] = useState<ExperienceMode>("edit");
  const [isOwner, setIsOwner] = useState(false);
  const [viewLocked, setViewLocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const urlLocked = readViewLockedFromUrl();
    const storedLocked = localStorage.getItem(VIEW_LOCKED_KEY) === "1";
    const locked = urlLocked || storedLocked;

    if (urlLocked) {
      localStorage.setItem(VIEW_LOCKED_KEY, "1");
    }

    setViewLocked(locked);

    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        const isLocalDev =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1");
        const owner = !!data.authenticated || (isLocalDev && !locked);
        setIsOwner(owner);

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
        if (locked || !isLocalDev) {
          setModeState("view");
          setViewLocked(true);
          document.documentElement.dataset.experience = "view";
        } else {
          setIsOwner(true);
          setModeState("edit");
          document.documentElement.dataset.experience = "edit";
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const setMode = useCallback(
    (next: ExperienceMode) => {
      if (viewLocked || !isOwner) return;
      if (next === "edit" && !isOwner) return;
      setModeState(next);
      localStorage.setItem(MODE_STORAGE_KEY, next);
      document.documentElement.dataset.experience = next;
    },
    [viewLocked, isOwner],
  );

  useEffect(() => {
    if (hydrated && viewLocked) {
      setModeState("view");
      document.documentElement.dataset.experience = "view";
    }
  }, [hydrated, viewLocked]);

  const toggleMode = useCallback(() => {
    if (viewLocked || !isOwner) return;
    setMode(mode === "edit" ? "view" : "edit");
  }, [mode, setMode, viewLocked, isOwner]);

  const isViewMode = mode === "view";
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
