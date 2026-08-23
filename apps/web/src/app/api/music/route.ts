import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getOrCreateDefaultUser, getSessionUserId } from "@/lib/auth/session";

export async function GET() {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const db = getDb();
  const items = await db
    .select()
    .from(schema.musicTracks)
    .where(eq(schema.musicTracks.userId, userId));
  return NextResponse.json({ tracks: items });
}

export async function POST(request: Request) {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const body = await request.json();
  const db = getDb();
  const [track] = await db
    .insert(schema.musicTracks)
    .values({
      userId,
      title: body.title,
      artist: body.artist ?? null,
      album: body.album ?? null,
      externalUrl: body.externalUrl ?? null,
    })
    .returning();
  return NextResponse.json({ track });
}
