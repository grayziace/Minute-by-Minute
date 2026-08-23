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
    .from(schema.places)
    .where(eq(schema.places.userId, userId));
  return NextResponse.json({ places: items });
}

export async function POST(request: Request) {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const body = await request.json();
  const db = getDb();
  const [place] = await db
    .insert(schema.places)
    .values({
      userId,
      name: body.name,
      placeType: body.placeType ?? "other",
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      address: body.address ?? null,
      amapPoiId: body.amapPoiId ?? null,
      notes: body.notes ?? null,
      visibility: "private",
    })
    .returning();
  return NextResponse.json({ place });
}
