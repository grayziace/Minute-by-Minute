import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getOrCreateDefaultUser, getSessionUserId } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    let userId = await getSessionUserId();
    if (!userId) userId = await getOrCreateDefaultUser();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q) return NextResponse.json({ results: [] });

    const db = getDb();
    const results = await db.execute(sql`
      SELECT e.* FROM entries e
      JOIN entries_search es ON es.entry_id = e.id
      WHERE e.user_id = ${userId}
        AND es.document @@ plainto_tsquery('english', ${q})
      ORDER BY ts_rank(es.document, plainto_tsquery('english', ${q})) DESC
      LIMIT 50
    `);

    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
