"use client";

import { db } from "@/lib/dexie/db";

/** Keys managed locally only — never synced to server. */
export const INTERNAL_META_KEYS = new Set([
  "lastHydratedAt",
  "lastMetaPushedAt",
  "lastMediaHydratedAt",
  "lastFullBackupAt",
]);

let metaPushTimer: ReturnType<typeof setTimeout> | null = null;
let pullingFromServer = false;

function scheduleMetaPush() {
  if (pullingFromServer) return;
  if (metaPushTimer) clearTimeout(metaPushTimer);
  metaPushTimer = setTimeout(() => {
    void pushSyncMetaToServer();
  }, 2000);
}

export function initMetaSync() {
  if (typeof window === "undefined") return;

  db.syncMeta.hook("creating", () => {
    scheduleMetaPush();
  });
  db.syncMeta.hook("updating", () => {
    scheduleMetaPush();
  });
  db.syncMeta.hook("deleting", () => {
    scheduleMetaPush();
  });
}

export async function pushSyncMetaToServer(): Promise<boolean> {
  if (!navigator.onLine) return false;

  const all = await db.syncMeta.toArray();
  const items = all
    .filter((row) => !INTERNAL_META_KEYS.has(row.key))
    .map((row) => ({ key: row.key, value: row.value }));

  if (items.length === 0) return true;

  try {
    const res = await fetch("/api/sync/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items }),
    });
    if (!res.ok) return false;
    await db.syncMeta.put({
      key: "lastMetaPushedAt",
      value: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function pullSyncMetaFromServer(): Promise<number> {
  if (!navigator.onLine) return 0;

  try {
    const res = await fetch("/api/sync/meta", { credentials: "include" });
    if (!res.ok) return 0;
    const data = await res.json();
    const items = (data.items ?? []) as { key: string; value: string }[];

    pullingFromServer = true;
    for (const item of items) {
      if (INTERNAL_META_KEYS.has(item.key)) continue;
      await db.syncMeta.put({ key: item.key, value: item.value });
    }
    pullingFromServer = false;
    return items.length;
  } catch {
    pullingFromServer = false;
    return 0;
  }
}

export async function getLastMetaPushedAt(): Promise<string | null> {
  const row = await db.syncMeta.get("lastMetaPushedAt");
  return row?.value ?? null;
}
