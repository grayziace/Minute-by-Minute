"use client";

import { db } from "@/lib/dexie/db";
import { hydrateFromServer, processSyncQueue } from "@/lib/sync/engine";
import { INTERNAL_META_KEYS, pushSyncMetaToServer, pullSyncMetaFromServer } from "@/lib/sync/meta-sync";
import {
  countMissingMediaBlobs,
  hydrateMissingMediaBlobs,
} from "@/lib/sync/media-hydrate";
import { processUploadQueue } from "@/lib/uploads/client";

export interface BackupStatus {
  entryCount: number;
  pendingEntries: number;
  metaKeyCount: number;
  lastMetaPushedAt: string | null;
  lastFullBackupAt: string | null;
  missingMediaCount: number;
  lastMediaHydratedAt: string | null;
}

export async function getBackupStatus(): Promise<BackupStatus> {
  const [entries, meta, lastMeta, lastBackup, lastMedia] = await Promise.all([
    db.entries.toArray(),
    db.syncMeta.toArray(),
    db.syncMeta.get("lastMetaPushedAt"),
    db.syncMeta.get("lastFullBackupAt"),
    db.syncMeta.get("lastMediaHydratedAt"),
  ]);

  return {
    entryCount: entries.length,
    pendingEntries: entries.filter((e) => e.syncStatus === "pending").length,
    metaKeyCount: meta.filter((m) => !INTERNAL_META_KEYS.has(m.key)).length,
    lastMetaPushedAt: lastMeta?.value ?? null,
    lastFullBackupAt: lastBackup?.value ?? null,
    missingMediaCount: await countMissingMediaBlobs(),
    lastMediaHydratedAt: lastMedia?.value ?? null,
  };
}

export interface BackupResult {
  entriesSynced: boolean;
  metaPushed: boolean;
  metaPulled: number;
  mediaHydrated: number;
}

/** Push local changes to the cloud. */
export async function fullBackupNow(
  onMediaProgress?: Parameters<typeof hydrateMissingMediaBlobs>[0],
): Promise<BackupResult> {
  await processUploadQueue();
  await processSyncQueue();
  const metaPushed = await pushSyncMetaToServer();
  const mediaHydrated = await hydrateMissingMediaBlobs(onMediaProgress);

  await db.syncMeta.put({
    key: "lastFullBackupAt",
    value: new Date().toISOString(),
  });

  return {
    entriesSynced: true,
    metaPushed,
    metaPulled: 0,
    mediaHydrated,
  };
}

/** Pull everything from the cloud onto this device. */
export async function restoreFromCloud(
  onMediaProgress?: Parameters<typeof hydrateMissingMediaBlobs>[0],
): Promise<BackupResult> {
  await hydrateFromServer();
  await processUploadQueue();
  await processSyncQueue();
  const metaPulled = await pullSyncMetaFromServer();
  const mediaHydrated = await hydrateMissingMediaBlobs(onMediaProgress);

  await db.syncMeta.put({
    key: "lastFullBackupAt",
    value: new Date().toISOString(),
  });

  return {
    entriesSynced: true,
    metaPushed: false,
    metaPulled,
    mediaHydrated,
  };
}

export async function downloadLocalBackupFile(): Promise<void> {
  const [entries, meta, media] = await Promise.all([
    db.entries.toArray(),
    db.syncMeta.toArray(),
    db.mediaAssets.toArray(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    source: "local",
    entries,
    syncMeta: meta.filter((m) => !INTERNAL_META_KEYS.has(m.key)),
    mediaAssets: media.map(({ localBlobUrl: _u, ...rest }) => rest),
  };

  triggerJsonDownload(payload, `minute-by-minute-backup-${dateStamp()}.json`);
}

export async function downloadCloudBackupFile(): Promise<void> {
  const res = await fetch("/api/backup/export", { credentials: "include" });
  if (!res.ok) throw new Error("Cloud export failed");
  const payload = await res.json();
  triggerJsonDownload(payload, `minute-by-minute-cloud-${dateStamp()}.json`);
}

function dateStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function triggerJsonDownload(payload: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
