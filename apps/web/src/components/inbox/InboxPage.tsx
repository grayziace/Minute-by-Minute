"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/dexie/db";
import { MediaThumb } from "@/components/media/MediaThumb";
import { formatTime, toDateKey, generateId, nowIso } from "@/lib/utils";
import { createEntryLocal } from "@/lib/sync/engine";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function InboxPage() {
  const items = useLiveQuery(async () => {
    const inbox = await db.inboxItems
      .where("status")
      .equals("unprocessed")
      .reverse()
      .sortBy("createdAt");
    const result = [];
    for (const item of inbox) {
      const asset = await db.mediaAssets.get(item.mediaAssetId);
      if (asset) result.push({ item, asset });
    }
    return result;
  }, []);

  async function assignToToday(mediaAssetId: string, inboxId: string) {
    const asset = await db.mediaAssets.get(mediaAssetId);
    if (!asset) return;

    const entryId = generateId();
    const recordedAt = asset.capturedAt ?? nowIso();
    const now = nowIso();

    await createEntryLocal({
      id: entryId,
      userId: asset.userId,
      recordedAt,
      recordedAtPrecision: "approximate",
      text: null,
      moodNote: null,
      locationName: null,
      locationLat: null,
      locationLng: null,
      locationAccuracy: null,
      locationPrivacy: "approximate",
      visibility: "private",
      source: "user",
      clientId: entryId,
      updatedAt: now,
      createdAt: now,
    });

    await db.mediaAssets.update(mediaAssetId, { entryId });
    await db.inboxItems.update(inboxId, { status: "placed" });
  }

  async function dismiss(inboxId: string) {
    await db.inboxItems.update(inboxId, { status: "dismissed" });
  }

  return (
    <PageShell>
      <header className="mb-8 memory-appear">
        <h1 className="font-serif text-3xl font-light text-gradient-angel">Inbox</h1>
        <p className="mt-2 text-sm text-muted">Capture first. Organise later.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {items?.map(({ item, asset }, i) => (
          <div
            key={item.id}
            className="memory-appear"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <GlassPanel className="overflow-hidden p-2">
            <MediaThumb asset={asset} size="lg" variant="float" />
            <div className="space-y-2 p-2">
              {item.suggestedDate && (
                <p className="text-[9px] uppercase tracking-wider text-secondary">
                  Suggested · {toDateKey(item.suggestedDate)}{" "}
                  {formatTime(item.suggestedDate)}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => void assignToToday(asset.id, item.id)}
                  className="flex-1 rounded-full bg-gradient-to-r from-ice/70 to-lavender/50 py-2 text-[9px] uppercase tracking-wider text-midnight"
                >
                  Place
                </button>
                <button
                  onClick={() => void dismiss(item.id)}
                  className="px-2 py-2 text-[9px] uppercase tracking-wider text-muted hover:text-foreground-soft"
                >
                  Skip
                </button>
              </div>
            </div>
          </GlassPanel>
          </div>
        ))}
      </div>

      {!items?.length && (
        <GlassPanel className="py-16 text-center">
          <div className="mx-auto mb-4 halo-loader opacity-40" />
          <p className="font-serif italic text-muted">Inbox is clear.</p>
        </GlassPanel>
      )}
    </PageShell>
  );
}
