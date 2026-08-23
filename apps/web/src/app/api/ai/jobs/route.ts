import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { getOrCreateDefaultUser, getSessionUserId } from "@/lib/auth/session";
import { createAiJob, processAiJob } from "@/lib/ai/jobs";

export async function GET() {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const db = getDb();
  const jobs = await db
    .select()
    .from(schema.aiJobs)
    .where(eq(schema.aiJobs.userId, userId))
    .orderBy(desc(schema.aiJobs.createdAt))
    .limit(20);
  const suggestions = await db
    .select()
    .from(schema.aiSuggestions)
    .where(eq(schema.aiSuggestions.userId, userId))
    .limit(50);
  return NextResponse.json({ jobs, suggestions });
}

export async function POST(request: Request) {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const body = await request.json();
  const job = await createAiJob(userId, body.type, body.input ?? {});
  void processAiJob(job.id);
  return NextResponse.json({ job });
}
