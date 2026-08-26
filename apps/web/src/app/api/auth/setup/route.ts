import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { getSetupError } from "@/lib/auth/rp-config";

export async function GET() {
  const configError = getSetupError();
  if (configError) {
    return NextResponse.json({ ready: false, error: configError });
  }

  try {
    const db = getDb();
    await db.select().from(schema.users).limit(1);
    return NextResponse.json({ ready: true });
  } catch {
    return NextResponse.json({
      ready: false,
      error:
        "Database connection failed. Check DATABASE_URL, then run db:push against your production database.",
    });
  }
}
