import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getOrCreateDefaultUser, getSessionUserId } from "@/lib/auth/session";
import {
  proposeEdit,
  reviseEdit,
  renderEdit,
} from "@/lib/video/edl-service";

export async function GET() {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const db = getDb();
  const projects = await db
    .select()
    .from(schema.editProjects)
    .where(eq(schema.editProjects.userId, userId));
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  let userId = await getSessionUserId();
  if (!userId) userId = await getOrCreateDefaultUser();
  const body = await request.json();

  if (body.action === "propose") {
    const result = await proposeEdit(userId, body.sourceMediaIds, body.instruction);
    return NextResponse.json(result);
  }

  if (body.action === "revise") {
    const result = await reviseEdit(body.projectId, body.instruction);
    return NextResponse.json(result);
  }

  if (body.action === "render") {
    const result = await renderEdit(body.projectId, body.revisionId);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
