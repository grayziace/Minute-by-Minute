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
    const rows = await db
      .select()
      .from(schema.userMeta)
      .where(eq(schema.userMeta.userId, userId));

    return NextResponse.json({
      items: rows.map((r) => ({
        key: r.key,
        value: r.value,
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Meta fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await resolveUserId();
    const body = await request.json();
    const items = (body.items ?? []) as { key: string; value: string }[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const db = getDb();
    const now = new Date();

    for (const item of items) {
      if (!item.key || typeof item.value !== "string") continue;
      await db
        .insert(schema.userMeta)
        .values({
          userId,
          key: item.key,
          value: item.value,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [schema.userMeta.userId, schema.userMeta.key],
          set: {
            value: item.value,
            updatedAt: now,
          },
        });
    }

    return NextResponse.json({ ok: true, count: items.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Meta sync failed" }, { status: 500 });
  }
}
