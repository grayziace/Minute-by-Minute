import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  getSessionUserId,
  getOrCreateDefaultUser,
} from "@/lib/auth/session";

async function resolveUserId() {
  let userId = await getSessionUserId();
  if (!userId) {
    userId = await getOrCreateDefaultUser();
  }
  return userId;
}

export async function GET() {
  try {
    const userId = await resolveUserId();
    const db = getDb();

    const entries = await db
      .select()
      .from(schema.entries)
      .where(eq(schema.entries.userId, userId));

    const mediaAssets = await db
      .select()
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.userId, userId));

    const meta = await db
      .select()
      .from(schema.userMeta)
      .where(eq(schema.userMeta.userId, userId));

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      version: 1,
      entries: entries.map((e) => ({
        ...e,
        recordedAt: e.recordedAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
      mediaAssets: mediaAssets.map((m) => ({
        ...m,
        capturedAt: m.capturedAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      syncMeta: meta.map((m) => ({
        key: m.key,
        value: m.value,
        updatedAt: m.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
