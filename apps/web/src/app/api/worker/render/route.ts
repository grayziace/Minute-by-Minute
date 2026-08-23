import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { projectId, revisionId, outputMediaId } = await request.json();
  // FFmpeg rendering runs in the worker container.
  // This endpoint acknowledges the render queue for MVP.
  console.log("Render queued:", { projectId, revisionId, outputMediaId });
  return NextResponse.json({ ok: true, status: "queued" });
}
