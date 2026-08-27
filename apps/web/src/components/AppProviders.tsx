"use client";

import { useEffect } from "react";
import { initSyncEngine, processSyncQueue } from "@/lib/sync/engine";
import { initMetaSync } from "@/lib/sync/meta-sync";
import { initUploadEngine } from "@/lib/uploads/client";
import { ExperienceModeProvider } from "@/lib/experience/mode";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initMetaSync();
    initSyncEngine();
    initUploadEngine();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SYNC") {
          void processSyncQueue();
        }
      });
    }
  }, []);

  return <ExperienceModeProvider>{children}</ExperienceModeProvider>;
}
