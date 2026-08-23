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
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const STORAGE_KEY = "mbm-experience-mode";

export function ExperienceModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ExperienceMode>("edit");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ExperienceMode | null;
    if (stored === "edit" || stored === "view") {
      setModeState(stored);
    }
    setHydrated(true);
  }, []);

  const setMode = useCallback((next: ExperienceMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.experience = next;
  }, []);

  useEffect(() => {
    if (hydrated) {
      document.documentElement.dataset.experience = mode;
    }
  }, [mode, hydrated]);

  const toggleMode = useCallback(() => {
    setMode(mode === "edit" ? "view" : "edit");
  }, [mode, setMode]);

  return (
    <ExperienceContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isViewMode: mode === "view",
        isEditMode: mode === "edit",
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
