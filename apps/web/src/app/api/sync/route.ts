import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  getSessionUserId,
  getOrCreateDefaultUser,
} from "@/lib/auth/session";
import { sql } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    let userId = await getSessionUserId();
    if (!userId) {
      userId = await getOrCreateDefaultUser();
    }

    const item = await request.json();
    const db = getDb();

    if (item.entityType === "entry") {
      const payload = item.payload;
      if (item.operation === "delete") {
        await db.delete(schema.entries).where(eq(schema.entries.id, item.entityId));
        return NextResponse.json({ ok: true });
      }

      const values = {
        id: payload.id,
        userId,
        recordedAt: new Date(payload.recordedAt),
        recordedAtPrecision: payload.recordedAtPrecision ?? "exact",
        text: payload.text ?? null,
        moodNote: payload.moodNote ?? null,
        locationName: payload.locationName ?? null,
        locationLat: payload.locationLat ?? null,
        locationLng: payload.locationLng ?? null,
        locationAccuracy: payload.locationAccuracy ?? null,
        locationPrivacy: payload.locationPrivacy ?? "approximate",
        visibility: payload.visibility ?? "private",
        source: payload.source ?? "user",
        syncStatus: "synced" as const,
        clientId: payload.clientId ?? null,
        updatedAt: new Date(payload.updatedAt ?? Date.now()),
        createdAt: new Date(payload.createdAt ?? Date.now()),
      };

      if (item.operation === "create") {
        await db.insert(schema.entries).values(values).onConflictDoUpdate({
          target: schema.entries.id,
          set: values,
        });
      } else {
        await db
          .update(schema.entries)
          .set(values)
          .where(eq(schema.entries.id, item.entityId));
      }

      await upsertSearch(db, payload.id, values.text, values.locationName, values.moodNote);
    }

    if (item.entityType === "inbox") {
      const payload = item.payload;
      await db.insert(schema.inboxItems).values({
        id: payload.id,
        mediaAssetId: payload.mediaAssetId,
        suggestedDate: payload.suggestedDate ? new Date(payload.suggestedDate) : null,
        suggestedLocation: payload.suggestedLocation ?? null,
        suggestedGroupId: payload.suggestedGroupId ?? null,
        aiMetadataJson: payload.aiMetadataJson ?? null,
        status: payload.status ?? "unprocessed",
      }).onConflictDoNothing();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

async function upsertSearch(
  db: ReturnType<typeof getDb>,
  entryId: string,
  text: string | null,
  location: string | null,
  mood: string | null,
) {
  const doc = [text, location, mood].filter(Boolean).join(" ");
  await db
    .insert(schema.entriesSearch)
    .values({
      entryId,
      document: sql`to_tsvector('english', ${doc})`,
    })
    .onConflictDoUpdate({
      target: schema.entriesSearch.entryId,
      set: { document: sql`to_tsvector('english', ${doc})` },
    });
}
