import { db, type SyncQueueItem } from "@/lib/dexie/db";
import type { Entry } from "@/lib/types";

const MAX_RETRIES = 5;

export type SyncState = "idle" | "syncing" | "offline" | "error";

let syncState: SyncState = "idle";
let listeners: ((state: SyncState) => void)[] = [];

export function getSyncState() {
  return syncState;
}

export function onSyncStateChange(cb: (state: SyncState) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function setSyncState(state: SyncState) {
  syncState = state;
  listeners.forEach((l) => l(state));
}

export async function enqueueSync(item: Omit<SyncQueueItem, "id" | "retryCount" | "createdAt">) {
  await db.syncQueue.add({
    ...item,
    id: crypto.randomUUID(),
    retryCount: 0,
    createdAt: new Date().toISOString(),
  });
  if (navigator.onLine) {
    void processSyncQueue();
  }
}

export async function createEntryLocal(
  entry: Omit<Entry, "syncStatus">,
): Promise<Entry> {
  const full: Entry = { ...entry, syncStatus: "pending" };
  await db.entries.put(full);
  await enqueueSync({
    entityType: "entry",
    entityId: entry.id,
    operation: "create",
    payload: full as unknown as Record<string, unknown>,
  });
  return full;
}

export async function updateEntryLocal(
  id: string,
  updates: Partial<Entry>,
): Promise<void> {
  const existing = await db.entries.get(id);
  if (!existing) return;
  const updated: Entry = {
    ...existing,
    ...updates,
    syncStatus: "pending",
    updatedAt: new Date().toISOString(),
  };
  await db.entries.put(updated);
  await enqueueSync({
    entityType: "entry",
    entityId: id,
    operation: "update",
    payload: updated as unknown as Record<string, unknown>,
  });
}

export async function deleteEntryLocal(id: string): Promise<void> {
  await db.entries.delete(id);
  await enqueueSync({
    entityType: "entry",
    entityId: id,
    operation: "delete",
    payload: { id },
  });
}

async function processSyncItem(item: SyncQueueItem): Promise<boolean> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
    credentials: "include",
  });
  return res.ok;
}

export async function processSyncQueue(): Promise<void> {
  if (!navigator.onLine) {
    setSyncState("offline");
    return;
  }

  setSyncState("syncing");
  const queue = await db.syncQueue.orderBy("createdAt").toArray();

  for (const item of queue) {
    try {
      const ok = await processSyncItem(item);
      if (ok) {
        await db.syncQueue.delete(item.id);
        if (item.entityType === "entry" && item.operation !== "delete") {
          const entry = await db.entries.get(item.entityId);
          if (entry) {
            await db.entries.update(item.entityId, { syncStatus: "synced" });
          }
        }
      } else if (item.retryCount >= MAX_RETRIES) {
        setSyncState("error");
      } else {
        await db.syncQueue.update(item.id, {
          retryCount: item.retryCount + 1,
        });
      }
    } catch {
      if (item.retryCount >= MAX_RETRIES) {
        setSyncState("error");
      } else {
        await db.syncQueue.update(item.id, {
          retryCount: item.retryCount + 1,
        });
      }
    }
  }

  setSyncState(navigator.onLine ? "idle" : "offline");
}

export async function hydrateFromServer(): Promise<void> {
  if (!navigator.onLine) return;
  try {
    const res = await fetch("/api/sync/hydrate", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    if (data.entries?.length) {
      await db.entries.bulkPut(
        data.entries.map((e: Entry) => ({ ...e, syncStatus: "synced" as const })),
      );
    }
    if (data.mediaAssets?.length) {
      await db.mediaAssets.bulkPut(data.mediaAssets);
    }
    if (data.inboxItems?.length) {
      await db.inboxItems.bulkPut(data.inboxItems);
    }
    if (data.tags?.length) {
      await db.tags.bulkPut(data.tags);
    }
    await db.syncMeta.put({
      key: "lastHydratedAt",
      value: new Date().toISOString(),
    });
  } catch {
    // silent — offline or unauthenticated
  }
}

export function initSyncEngine() {
  if (typeof window === "undefined") return;

  window.addEventListener("online", () => {
    void processSyncQueue();
  });

  window.addEventListener("focus", () => {
    void processSyncQueue();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void processSyncQueue();
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        const syncManager = (reg as ServiceWorkerRegistration & {
          sync?: { register: (tag: string) => Promise<void> };
        }).sync;
        return syncManager?.register("mbm-sync");
      })
      .catch(() => {
        void processSyncQueue();
      });
  }

  void hydrateFromServer().then(() => processSyncQueue());
}
