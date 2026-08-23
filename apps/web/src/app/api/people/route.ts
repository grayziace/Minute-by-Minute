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
    .from(schema.people)
    .where(eq(schema.people.userId, userId));
  return NextResponse.json({ people: items });
}

export async function POST(request: Request) {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const body = await request.json();
  const db = getDb();
  const [person] = await db
    .insert(schema.people)
    .values({
      userId,
      name: body.name,
      nickname: body.nickname ?? null,
      notes: body.notes ?? null,
      visibility: "private",
    })
    .returning();
  return NextResponse.json({ person });
}
