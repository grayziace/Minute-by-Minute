"use client";

import { useCallback, useEffect, useState } from "react";
import {
  downloadCloudBackupFile,
  downloadLocalBackupFile,
  fullBackupNow,
  getBackupStatus,
  restoreFromCloud,
  type BackupStatus,
} from "@/lib/sync/backup";

export function BackupPanel() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaProgress, setMediaProgress] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus(await getBackupStatus());
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleBackup() {
    setBusy(true);
    setMessage("");
    setMediaProgress(null);
    try {
      const result = await fullBackupNow((p) => {
        if (p.total > 0) {
          setMediaProgress(`Downloading photos ${p.done}/${p.total}…`);
        }
      });
      setMessage(
        `Backed up to cloud.${result.mediaHydrated > 0 ? ` ${result.mediaHydrated} photos downloaded.` : ""}`,
      );
      await refresh();
    } catch {
      setMessage("Backup failed — check you're online and signed in.");
    }
    setBusy(false);
    setMediaProgress(null);
  }

  async function handleRestore() {
    setBusy(true);
    setMessage("");
    setMediaProgress(null);
    try {
      const result = await restoreFromCloud((p) => {
        if (p.total > 0) {
          setMediaProgress(`Restoring photos ${p.done}/${p.total}…`);
        }
      });
      setMessage(
        `Restored from cloud. ${result.metaPulled} settings, ${result.mediaHydrated} photos on this device.`,
      );
      await refresh();
    } catch {
      setMessage("Restore failed — check you're online and signed in.");
    }
    setBusy(false);
    setMediaProgress(null);
  }

  async function handleLocalExport() {
    try {
      await downloadLocalBackupFile();
      setMessage("Local backup file downloaded.");
    } catch {
      setMessage("Could not create local backup file.");
    }
  }

  async function handleCloudExport() {
    setBusy(true);
    try {
      await downloadCloudBackupFile();
      setMessage("Cloud backup file downloaded from server.");
    } catch {
      setMessage("Cloud export failed — sign in and try again.");
    }
    setBusy(false);
  }

  function formatWhen(iso: string | null) {
    if (!iso) return "Never";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <section className="backup-panel paper-note paper-note--sky">
      <h2 className="storybook-widget__title">Forever backup</h2>
      <p className="backup-panel__intro">
        Your moments, characters, frame favourites, and day chapters are saved to the cloud.
        Photos live in secure storage and download automatically on new devices.
      </p>

      {status && (
        <dl className="backup-panel__stats">
          <div>
            <dt>Moments</dt>
            <dd>
              {status.entryCount}
              {status.pendingEntries > 0 && (
                <span className="backup-panel__warn"> · {status.pendingEntries} waiting to sync</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Settings & stories</dt>
            <dd>{status.metaKeyCount} saved locally</dd>
          </div>
          <div>
            <dt>Photos on this device</dt>
            <dd>
              {status.missingMediaCount === 0
                ? "All downloaded"
                : `${status.missingMediaCount} to download`}
            </dd>
          </div>
          <div>
            <dt>Last cloud backup</dt>
            <dd>{formatWhen(status.lastFullBackupAt ?? status.lastMetaPushedAt)}</dd>
          </div>
        </dl>
      )}

      <div className="backup-panel__actions">
        <button
          type="button"
          className="backup-panel__primary"
          disabled={busy}
          onClick={() => void handleBackup()}
        >
          {busy ? "Saving…" : "Backup everything now"}
        </button>
        <button
          type="button"
          className="backup-panel__ghost"
          disabled={busy}
          onClick={() => void handleRestore()}
        >
          Restore from cloud
        </button>
      </div>

      <div className="backup-panel__exports">
        <button type="button" className="backup-panel__link" disabled={busy} onClick={() => void handleLocalExport()}>
          Download local backup file
        </button>
        <button type="button" className="backup-panel__link" disabled={busy} onClick={() => void handleCloudExport()}>
          Download cloud backup file
        </button>
      </div>

      {mediaProgress && <p className="backup-panel__progress">{mediaProgress}</p>}
      {message && <p className="backup-panel__message">{message}</p>}

      <p className="backup-panel__hint">
        Sign in with your password so backups attach to your account. Keep{" "}
        <code>DATABASE_URL</code> and R2 storage configured on Vercel — code changes never delete your archive.
      </p>
    </section>
  );
}
