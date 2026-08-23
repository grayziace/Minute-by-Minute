"use client";

import { useEffect, useState } from "react";
import { onSyncStateChange, getSyncState, type SyncState } from "@/lib/sync/engine";

const LABELS: Record<SyncState, string | null> = {
  idle: null,
  syncing: "Syncing…",
  offline: "Saved locally",
  error: "Will retry",
};

export function SyncIndicator() {
  const [state, setState] = useState<SyncState>(getSyncState());

  useEffect(() => {
    return onSyncStateChange(setState);
  }, []);

  const label = LABELS[state];
  if (!label) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-[env(safe-area-inset-top)] pointer-events-none">
      <span className="mt-3 rounded-full glass px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
    </div>
  );
}
