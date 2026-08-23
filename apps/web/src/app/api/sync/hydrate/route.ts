import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import {
  getSessionUserId,
  getOrCreateDefaultUser,
} from "@/lib/auth/session";

export async function GET() {
  try {
    let userId = await getSessionUserId();
    if (!userId) {
      userId = await getOrCreateDefaultUser();
    }

    const db = getDb();
    const entries = await db
      .select()
      .from(schema.entries)
      .where(eq(schema.entries.userId, userId))
      .orderBy(desc(schema.entries.recordedAt))
      .limit(500);

    const mediaAssets = await db
      .select()
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.userId, userId))
      .orderBy(desc(schema.mediaAssets.createdAt))
      .limit(500);

    const inboxItems = await db.select().from(schema.inboxItems).limit(200);
    const tags = await db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.userId, userId));

    return NextResponse.json({
      entries: entries.map(serializeEntry),
      mediaAssets: mediaAssets.map(serializeMedia),
      inboxItems,
      tags,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hydrate failed" }, { status: 500 });
  }
}

function serializeEntry(e: typeof schema.entries.$inferSelect) {
  return {
    id: e.id,
    userId: e.userId,
    recordedAt: e.recordedAt.toISOString(),
    recordedAtPrecision: e.recordedAtPrecision,
    text: e.text,
    moodNote: e.moodNote,
    locationName: e.locationName,
    locationLat: e.locationLat,
    locationLng: e.locationLng,
    locationAccuracy: e.locationAccuracy,
    locationPrivacy: e.locationPrivacy,
    visibility: e.visibility,
    source: e.source,
    syncStatus: e.syncStatus,
    clientId: e.clientId,
    updatedAt: e.updatedAt.toISOString(),
    createdAt: e.createdAt.toISOString(),
  };
}

function serializeMedia(m: typeof schema.mediaAssets.$inferSelect) {
  return {
    id: m.id,
    userId: m.userId,
    entryId: m.entryId,
    storageKey: m.storageKey,
    originalFilename: m.originalFilename,
    mimeType: m.mimeType,
    byteSize: m.byteSize,
    sha256: m.sha256,
    capturedAt: m.capturedAt?.toISOString() ?? null,
    durationMs: m.durationMs,
    exifJson: m.exifJson,
    gpsJson: m.gpsJson,
    uploadStatus: m.uploadStatus,
    uploadMultipartId: m.uploadMultipartId,
    visibility: m.visibility,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}
